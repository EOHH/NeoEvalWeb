import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Plus, Save, Layout, CheckCircle2, Trash2, X, ToggleLeft, AlignLeft, Edit2 } from 'lucide-react';

import { Button } from '@/components/elements/Button';
import { examsApi } from '../api/exams';
import type { QuestionRequestDTO } from '../api/exams';

type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'OPEN_ENDED' | null;

const defaultFormValues = {
  questionText: '',
  points: 10,
  difficulty: 3.0,
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false }
  ],
  trueFalseAnswer: 'TRUE',
  openEndedAnswer: ''
};

export const QuestionsEditorPage = () => {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados del Modal
  const [activeModal, setActiveModal] = useState<QuestionType>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions', examId],
    queryFn: () => examsApi.getQuestionsByExam(examId),
  });

  const { register, control, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: defaultFormValues
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  });

  // Cierra el modal y limpia todo
  const handleCloseModal = () => {
    setActiveModal(null);
    setEditingQuestionId(null);
    reset(defaultFormValues);
  };

  // 🚀 LÓGICA DE EDICIÓN: Desempaqueta el JSON del backend y llena el formulario
  const openEditModal = (q: any) => {
    setEditingQuestionId(q.id);
    setActiveModal(q.questionType as QuestionType);

    // Intentamos parsear los JSON que vienen de Spring Boot
    let parsedOptions: any = {};
    let parsedCorrect: any = {};
    
    try { if (q.options && q.options !== '{}') parsedOptions = JSON.parse(q.options); } catch (e) {}
    try { if (q.correctAnswer) parsedCorrect = JSON.parse(q.correctAnswer); } catch (e) {}

    const formValues = { ...defaultFormValues, questionText: q.questionText, points: q.points, difficulty: q.difficulty };

    if (q.questionType === 'MULTIPLE_CHOICE') {
      // Reconstruimos el arreglo [{text, isCorrect}] a partir del Map {"A": "texto"}
      const rebuiltOptions = Object.keys(parsedOptions).map(key => ({
        text: parsedOptions[key],
        isCorrect: parsedCorrect?.key === key
      }));
      formValues.options = rebuiltOptions.length > 0 ? rebuiltOptions : defaultFormValues.options;
    } 
    else if (q.questionType === 'TRUE_FALSE') {
      formValues.trueFalseAnswer = parsedCorrect?.value || 'TRUE';
    } 
    else if (q.questionType === 'OPEN_ENDED') {
      // En OPEN_ENDED, el correctAnswer es un string JSON puro (ej. "Revolución")
      formValues.openEndedAnswer = typeof parsedCorrect === 'string' ? parsedCorrect : (parsedCorrect?.value || '');
    }

    reset(formValues);
  };

  // MUTACIÓN PARA CREAR
  const { mutate: createQuestion, isPending: isCreating } = useMutation({
    mutationFn: (payload: QuestionRequestDTO) => examsApi.createQuestion(examId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', examId] });
      handleCloseModal();
    },
    onError: () => alert("Hubo un error al guardar la pregunta.")
  });

  // 🚀 NUEVA MUTACIÓN PARA ACTUALIZAR
  const { mutate: updateQuestion, isPending: isUpdating } = useMutation({
    mutationFn: (data: { id: number, payload: QuestionRequestDTO }) => examsApi.updateQuestion(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', examId] });
      handleCloseModal();
    },
    onError: () => alert("Hubo un error al actualizar la pregunta.")
  });

  const { mutate: deleteQuestion, isPending: isDeleting } = useMutation({
    mutationFn: (questionId: number) => examsApi.deleteQuestion(questionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions', examId] }),
  });

  // Procesador principal al enviar el formulario
  const onSubmitForm = (data: any) => {
    const payload: QuestionRequestDTO = {
      questionText: data.questionText,
      questionType: activeModal!,
      difficulty: data.difficulty,
      points: data.points,
      options: '{}',
      correctAnswer: '',
    };

    if (activeModal === 'MULTIPLE_CHOICE') {
      const optionsMap: Record<string, string> = {};
      let correctKey = "", correctValue = "";

      data.options.forEach((opt: any, index: number) => {
        const letter = String.fromCharCode(65 + index);
        optionsMap[letter] = opt.text;
        if (opt.isCorrect) {
          correctKey = letter; correctValue = opt.text;
        }
      });
      payload.options = JSON.stringify(optionsMap);
      payload.correctAnswer = JSON.stringify({ key: correctKey, value: correctValue });
    } 
    else if (activeModal === 'TRUE_FALSE') {
      payload.options = JSON.stringify({});
      payload.correctAnswer = JSON.stringify({ value: data.trueFalseAnswer });
    } 
    else if (activeModal === 'OPEN_ENDED') {
      payload.options = JSON.stringify({});
      payload.correctAnswer = JSON.stringify(data.openEndedAnswer);
    }

    // Decidimos si Creamos o Actualizamos
    if (editingQuestionId) {
      updateQuestion({ id: editingQuestionId, payload });
    } else {
      createQuestion(payload);
    }
  };

  const handleSetCorrect = (indexToSetCorrect: number) => {
    const currentOptions = getValues('options');
    currentOptions.forEach((_, idx) => {
      setValue(`options.${idx}.isCorrect`, idx === indexToSetCorrect);
    });
  };

  const getModalTitle = () => {
    const prefix = editingQuestionId ? 'Editar Pregunta:' : 'Nueva Pregunta:';
    if (activeModal === 'MULTIPLE_CHOICE') return `${prefix} Opción Múltiple`;
    if (activeModal === 'TRUE_FALSE') return `${prefix} Verdadero o Falso`;
    if (activeModal === 'OPEN_ENDED') return `${prefix} Respuesta Abierta`;
    return '';
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/exams')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Editor de Preguntas</h1>
            <p className="text-sm text-slate-500">Examen #{examId}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate(`/exams/${examId}`)}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Finalizar Examen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl sticky top-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Layout className="h-4 w-4" /> Agregar
            </h3>
            <div className="space-y-2">
              <button onClick={() => setActiveModal('MULTIPLE_CHOICE')} className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-indigo-600 transition-colors text-sm font-medium flex items-center justify-between group">
                <span className="flex items-center gap-2"><Layout className="h-4 w-4" /> Opción Múltiple</span>
                <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={() => setActiveModal('TRUE_FALSE')} className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-indigo-600 transition-colors text-sm font-medium flex items-center justify-between group">
                <span className="flex items-center gap-2"><ToggleLeft className="h-4 w-4" /> Verdadero / Falso</span>
                <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={() => setActiveModal('OPEN_ENDED')} className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-indigo-600 transition-colors text-sm font-medium flex items-center justify-between group">
                <span className="flex items-center gap-2"><AlignLeft className="h-4 w-4" /> Respuesta Abierta</span>
                <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="text-center p-10 text-slate-500">Cargando preguntas...</div>
          ) : questions.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-indigo-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Aún no hay preguntas</h2>
              <p className="text-slate-500 max-w-xs mx-auto mt-1">Selecciona un tipo de pregunta a la izquierda para empezar.</p>
            </div>
          ) : (
            questions.map((q: any, index: number) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4 transition-all hover:shadow-md hover:border-indigo-200">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{q.questionType.replace('_', ' ')}</span>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{q.points} pts</span>
                      
                      {/* 🚀 Botón de Editar */}
                      <button 
                        onClick={() => openEditModal(q)}
                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"
                        title="Editar pregunta"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Botón de Eliminar */}
                      <button 
                        onClick={() => { if (window.confirm('¿Seguro que deseas eliminar esta pregunta?')) deleteQuestion(q.id); }}
                        disabled={isDeleting}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors disabled:opacity-50"
                        title="Eliminar pregunta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-slate-800 font-medium text-lg whitespace-pre-wrap">{q.questionText}</h3>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold text-slate-900">{getModalTitle()}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Enunciado de la pregunta *</label>
                <textarea 
                  {...register('questionText', { required: true })}
                  className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  placeholder="Escribe la pregunta aquí..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Puntos</label>
                  <input type="number" {...register('points', { valueAsNumber: true })} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Dificultad (1 a 5)</label>
                  <input type="number" step="0.1" {...register('difficulty', { valueAsNumber: true })} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
              </div>

              {activeModal === 'MULTIPLE_CHOICE' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Opciones de Respuesta</label>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="correctOption" 
                          className="w-5 h-5 accent-indigo-600 cursor-pointer"
                          defaultChecked={getValues(`options.${index}.isCorrect`)}
                          onChange={(e) => e.target.checked && handleSetCorrect(index)}
                        />
                        <input 
                          {...register(`options.${index}.text`, { required: true })}
                          className="flex-grow p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {fields.length > 2 && (
                          <button type="button" onClick={() => remove(index)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {fields.length < 5 && (
                    <Button type="button" variant="outline" className="mt-4 w-full border-dashed" onClick={() => append({ text: '', isCorrect: false })}>
                      <Plus className="h-4 w-4 mr-2" /> Agregar otra opción
                    </Button>
                  )}
                </div>
              )}

              {activeModal === 'TRUE_FALSE' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-4">¿Cuál es la respuesta correcta?</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-indigo-500 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 transition-all">
                      <input type="radio" value="TRUE" {...register('trueFalseAnswer')} className="w-5 h-5 accent-indigo-600" />
                      <span className="font-semibold text-slate-700">Verdadero</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-indigo-500 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 transition-all">
                      <input type="radio" value="FALSE" {...register('trueFalseAnswer')} className="w-5 h-5 accent-indigo-600" />
                      <span className="font-semibold text-slate-700">Falso</span>
                    </label>
                  </div>
                </div>
              )}

              {activeModal === 'OPEN_ENDED' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Palabra o frase clave de la respuesta *</label>
                  <input 
                    {...register('openEndedAnswer', { required: activeModal === 'OPEN_ENDED' })}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ej. Revolución Francesa"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                <Button type="submit" isLoading={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                  <Save className="h-4 w-4 mr-2" /> {editingQuestionId ? 'Guardar Cambios' : 'Guardar Pregunta'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};