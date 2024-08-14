"use client";

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import markdownIt from 'markdown-it';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';

interface ContentPart {
  text: string;
}

interface Content {
  role: string;
  parts: ContentPart[];
}

const inputs = z.object({ text: z.string().min(1) });

type InputsSchema = z.infer<typeof inputs>;

export default function Gerador(): JSX.Element {
  const { register, handleSubmit } = useForm<InputsSchema>();
  const [output, setOutput] = useState<string>('');

  const API_KEY: string = 'AIzaSyAhn4Wz89_Kqto2jHixKvECbjfiUa9y1ic';

  const handleSubmitForm = async (data: InputsSchema) => {
    const contents: Content[] = [
      {
        role: 'user',
        parts: []
      }
    ];
    contents[0].parts.push({ text: data.text });

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // or gemini-1.5-pro
      systemInstruction: 
      "Você é um assistente de professor de ensino fundamental que gera planos de aula sobre computação e tecnologia. Suas respostas devem ser todas em português",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    console.log("loading-result");
    const result = await model.generateContentStream({ contents });

    const md = new markdownIt();
    let buffer = '';

    for await (let response of result.stream) {
      const text = await response.text();
      buffer += text; // Append new text to the buffer
      setOutput(md.render(buffer)); // Update output with the rendered content
    }
  };

  return (
    <body>
      <main>
        <header>
          <div><span>👩‍🏫</span></div>
          <h1>Gerador de Planos de Aula</h1>
        </header>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <div>
            <label>
              <input {...register('text')} placeholder="Digite suas instruções aqui" type="text" className='text-black' />
            </label>
            <button type="submit">Ir</button>
          </div>
        </form>
        <p>(Resultados vão aparecer aqui)</p>
        <div className="output" dangerouslySetInnerHTML={{ __html: output }} />
      </main>
    </body>
  );
}
