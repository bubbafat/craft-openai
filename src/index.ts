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
});

function onGenerate() {
  console.log("onGenerate called");

  const token = (<HTMLInputElement>document.getElementById('openai-token')).value;
  const prompt = (<HTMLInputElement>document.getElementById('openai-prompt')).value;

  const query = buildOAIQuery(prompt, 'text-babbage-001');

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

type OpenAIModel = 'text-davinci-002' | 'text-curie-001' | 'text-babbage-001' | 'text-ada-001';

type OpenAIQuery = {
  model: OpenAIModel;
  prompt: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

function buildOAIQuery(promptStr: string, modelStr: OpenAIModel) {
  const model: OpenAIQuery =
  {
    model: modelStr,
    prompt: promptStr,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  return model;
}
