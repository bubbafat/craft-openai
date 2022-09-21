import "./style.css"
import craftXIconSrc from "./craftx-icon.png"

craft.env.setListener((env) => {
  switch (env.colorScheme) {
    case "dark":
      document.body.classList.add("dark");
      break;
    case "light":
      document.body.classList.remove("dark");
      break;
  }
})

window.addEventListener("load", () => {
  const generateButton: HTMLButtonElement = document.getElementById('btn-generate') as HTMLButtonElement;
  generateButton.onclick = () => { onGenerate(); }

  const logoImg = document.getElementById('craftx-logo') as HTMLImageElement
  logoImg.src = craftXIconSrc;

  const oaiModelSelect = document.getElementById('openai-model') as HTMLSelectElement;

  addModelSelect(OpenAIModel.Davinci002, oaiModelSelect);
  addModelSelect(OpenAIModel.Curie001, oaiModelSelect);
  addModelSelect(OpenAIModel.Babbage001, oaiModelSelect);
  addModelSelect(OpenAIModel.Ada001, oaiModelSelect);
});

function addModelSelect(name: string, select: HTMLSelectElement) {
  const opt = document.createElement("option");
  opt.value = name;
  opt.text = name;
  select.add(opt, null);
}

function onGenerate() {
  console.log("onGenerate called");

  const token = (<HTMLInputElement>document.getElementById('openai-token')).value;
  const prompt = (<HTMLInputElement>document.getElementById('openai-prompt')).value;
  const model = (<HTMLSelectElement>document.getElementById('openai-model')).value;

  const query = buildOAIQuery(prompt, model);

  const promptBlock = craft.blockFactory.textBlock({
    content: query.prompt
  });

  craft.dataApi.addBlocks([promptBlock]);

  fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(query)
    }
  )
  .then((response) => response.json())
  .then((data) => {
    console.log('Success:', data.choices[0].text);

    const contentBlock = craft.blockFactory.textBlock({
      content: data.choices[0].text
    });

    craft.dataApi.addBlocks([contentBlock]);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

enum OpenAIModel {
  Davinci002 = 'text-davinci-002',
  Curie001 = 'text-curie-001',
  Babbage001 = 'text-babbage-001',
  Ada001 = 'text-ada-001'
}

type OpenAIQuery = {
  model: string;
  prompt: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

function buildOAIQuery(promptStr: string, algorithm: string) {
  const model: OpenAIQuery =
  {
    model: algorithm,
    prompt: promptStr,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  return model;
}
