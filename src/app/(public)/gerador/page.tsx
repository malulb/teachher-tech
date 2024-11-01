"use client";

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import markdownIt from 'markdown-it';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyDocument  from './documento';
import MultiSelectCheckbox  from './dropdown';
import MultiSelectSubjects  from './multiselect';

interface ContentPart {
  text: string;
}

interface Content {
  role: string;
  parts: ContentPart[];
}

interface TopicsData {
  [area: string]: {
    [grade: string]: [];
  };
}


const inputs = z.object({ 
  text: z.string().optional(), 
  grade: z.string(),
  classDuration: z.string(),
  numberOfClasses: z.string(),
  area: z.string().optional(), // Make optional if it's not always used
  topics: z.array(z.string()).optional(),
  intersectionality: z.boolean(),
  otherSubjects: z.array(z.string()).optional(),
  intersectionalityDetails: z.string().optional(),
});


type InputsSchema = z.infer<typeof inputs>;

export default function Gerador(): JSX.Element {
  const { register, handleSubmit, watch, setValue, reset} = useForm<InputsSchema>();
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedGrade, setSelectedGrade] = useState('1ª série');
  const [showForm, setShowForm] = useState(true);
  const [selectedArea, setSelectedArea] = useState('Cultura Digital');
  const [topics, setTopics] =  useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicsData, setTopicsData] = useState<TopicsData>({});


  const classDuration = watch('classDuration', '50'); // Default to 50 minutes
  const numberOfClasses = watch('numberOfClasses', '4');
  const otherSubjects = watch("otherSubjects") || []; 

  const API_KEY: string = process.env.NEXT_PUBLIC_API_KEY as string;

  //console.log("API Key:", process.env.REACT_APP_API_KEY);


  useEffect(() => {
    // Fetch the JSON data when the component mounts
    fetch('/BNCC.json')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data); // Check if data is fetched correctly
        setTopicsData(data);
      })
      .catch(error => console.error('Error loading topics data:', error));
  }, []);

  useEffect(() => {
    setValue('grade', selectedGrade);  // <-- Ensure grade is set when component loads
    setValue('area', selectedArea);
    if (selectedGrade && selectedArea && topicsData[selectedArea]) {
      const availableTopics = topicsData[selectedArea][selectedGrade] || [];
      setTopics(availableTopics);
      //setSelectedTopics([]); // Reset selected topics when grade or area changes
    }
  }, [selectedGrade, selectedArea, topicsData]);

  const handleSubmitForm = async (data: InputsSchema) => {
    if (selectedTopics.length === 0) {
      setOutput('Por favor, selecione pelo menos um tópico.');
      return;
    }
    setLoading(true)
    let prompt = `Por favor, gere um plano de aula focando nos tópicos '${selectedTopics.join(', ')}' para a série ${data.grade}. O assunto será abordado em ${data.numberOfClasses} aulas com duração de ${data.classDuration} minutos cada.`;
    if (data.otherSubjects && data.otherSubjects.length > 0) {
      const subjects = data.otherSubjects.join(", ");
      prompt += ` Esta aula deve incluir elementos de interseccionalidade com ${subjects}. Detalhes adicionais: ${data.intersectionalityDetails}.`;
    }
    if (data.text && data.text.trim() !== '') {
      prompt += ` Comentários adicionais: ${data.text}.`;
    }

    const contents: Content[] = [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // or gemini-1.5-flash
      systemInstruction: 
      "Você é um assistente de professor de ensino fundamental que gera planos de aula sobre computação e tecnologia para alunos de escola pública com poucos recursos. Suas respostas devem ser todas em português",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });



    setLoading(true); // Set loading state to true
    setOutput('Gerando Resposta...'); 

    try{

        const result = await model.generateContentStream({ contents });
    
        const md = new markdownIt();
        let buffer = '';
    
        for await (let response of result.stream) {
          const text = await response.text();
          buffer += text; // Append new text to the buffer
          setOutput(md.render(buffer)); // Update output with the rendered content
        }

    } catch (error) {
      console.error('Error generating content:', error);
      setOutput('Ocorreu um erro ao gerar a resposta.');
    } finally {
      setShowForm(false);
      setLoading(false);
    }
  };

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    setValue('grade', grade);
  };

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setValue('area', area);
  };


  const handleNewPlan = () => {
    setShowForm(true);
    setOutput('');
    reset();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <span className="mr-2">👩‍🏫</span>
        Gerador de Planos de Aula
      </h1>
      {showForm ? (
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interdisciplinaridade</label>
            <div className="mt-4">
            <MultiSelectSubjects
      register={register}
      setValue={setValue}
      defaultValue={[]}
    />
            </div>

            {otherSubjects.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Detalhes da interdisciplinaridade</label>
                <input
                  {...register('intersectionalityDetails', { required: true })}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Descreva que assunto específico deseja abordar e como você gostaria de integrar as duas disciplinas"
                />
              </div>
            )}
          </div>    
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Série</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {['1ª', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª', '8ª', '9ª'].map((serie) => (
                <button
                  key={serie}
                  type="button"
                  className={`py-2 px-4 rounded-md text-sm font-medium ${
                    selectedGrade === `${serie} série`
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleGradeSelect(`${serie} série`)}
                >
                  {serie}ª
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eixo</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {Object.keys(topicsData).map((area) => (
                <button
                  key={area}
                  type="button"
                  className={`py-2 px-4 rounded-md text-sm font-medium ${
                    selectedArea === area
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleAreaSelect(area)}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
          {topics.length > 0 && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-2">Habilidade</label>
              <MultiSelectCheckbox
                options={topics}
                selectedOptions={selectedTopics}
                onChange={setSelectedTopics}
              />
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração da Aula (min): {classDuration}
            </label>
            <input
              {...register('classDuration')}
              type="range"
              min="20"
              max="120"
              defaultValue="50"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Aulas: {numberOfClasses}
            </label>
            <input
              {...register('numberOfClasses')}
              type="range"
              min="1"
              max="10"
              defaultValue="4"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentários adicionais (opcional):</label>
            <textarea
              {...register('text')}
              className="w-full p-2 border border-gray-300 rounded resize-y"
              placeholder="Aqui você pode incluir qualquer especificidade em relação à sua aula. Ex: incluir alguma atividade em grupo, quantos alunos tem na sala, materiais que você deseja que sejam usados na aula ou materiais que não estão disponíveis."
              rows={3}
            ></textarea>
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Gerar Plano
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div id="lesson-plan-content" className="prose max-w-none" dangerouslySetInnerHTML={{ __html: output }} />
          <div className="space-x-4 grid grid-cols-2">
          <button
            onClick={handleNewPlan}
            className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Gerar Novo Plano
          </button>
          <PDFDownloadLink
              document={<MyDocument content={output} />}
              fileName="plano-de-aula.pdf"
              className="flex-1 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {({ loading }) =>
                loading ? 'Gerando PDF...' : 'Baixar como PDF'
              }
            </PDFDownloadLink>
          </div>
        </div>
      )}
      {loading && <p className="mt-4 text-center">Gerando plano de aula...</p>}
    </div>
  );
}
