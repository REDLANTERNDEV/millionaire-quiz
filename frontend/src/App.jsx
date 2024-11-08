import { useCallback, useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Navbar from './Navbar';

function App() {
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [isOptionDisabled, setIsOptionDisabled] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isFirstQuestion, setIsFirstQuestion] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [questionId, setQuestionId] = useState(null);

  const getDifficulty = (step) => {
    if (step >= 1 && step <= 5) return 'easy';
    if (step >= 6 && step <= 10) return 'medium';
    if (step >= 11 && step <= 13) return 'hard';
    return 'easy';
  };

  // Move fetchQuestion outside of useEffect
  const fetchQuestion = useCallback(async () => {
    const difficulty = getDifficulty(currentStep);
    try {
      const response = await fetch(
        `http://localhost:3000/question/${difficulty}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setQuestion(data);
      setQuestionId(data.id);
    } catch (error) {
      setError(error.message);
    }
  }, [currentStep]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  useEffect(() => {
    if (isFirstQuestion || !isTimerRunning) return;

    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          setModalMessage(
            'Süreniz bitti! Baştan başlamak için butona tıklayın.'
          );
          setIsOptionDisabled(true);
          setShowModal(true);
          setIsTimerRunning(false);
          return 60;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFirstQuestion, isTimerRunning]);

  const handleOptionClick = async (option) => {
    setSelectedOption(option);
    setIsOptionDisabled(true);
    setIsTimerRunning(false);
    if (question) {
      try {
        const response = await fetch(
          `http://localhost:3000/answer/${getDifficulty(
            currentStep
          )}/${questionId}`,
          {
            headers: {
              'x-secret-key': 'your_secret_key',
            },
          }
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setIsAnswerCorrect(option === data.answer);
        setCorrectAnswer(data.answer);

        if (option === data.answer) {
          if (currentStep === 13) {
            setModalMessage('Tebrikler! Tüm soruları doğru bildiniz.');
            setShowModal(true);
          } else {
            setTimeout(() => {
              handleNextQuestion();
            }, 1000);
          }
        } else {
          setModalMessage(
            <>
              Doğru cevap:{' '}
              <span className="text-white bg-green-500 rounded-lg p-1 font-bold">
                {' '}
                {data.answer}
              </span>
              . Baştan başlamak için butona tıklayın.
            </>
          );
          setShowModal(true);
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleNextQuestion = () => {
    setCurrentStep((prevStep) => prevStep + 1);
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setIsOptionDisabled(false);
    setCorrectAnswer(null);
    setTimer(60);
    setIsFirstQuestion(false);
    setIsTimerRunning(true);
    setShowModal(false);
    setQuestionId(null);
    setQuestion(null); // Reset question before fetching new one
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setIsOptionDisabled(false);
    setCorrectAnswer(null);
    setTimer(60);
    setIsFirstQuestion(true);
    setShowModal(false);
    setError(null);
    setIsTimerRunning(false);
    setQuestionId(null);
    setQuestion(null);
    fetchQuestion();
  };

  const moneyPyramid = useMemo(
    () =>
      [
        { id: 1, amount: '2.000 ₺' },
        { id: 2, amount: '5.000 ₺' },
        { id: 3, amount: '7.500 ₺' },
        { id: 4, amount: '10.000 ₺' },
        { id: 5, amount: '20.000 ₺' },
        { id: 6, amount: '30.000 ₺' },
        { id: 7, amount: '50.000 ₺' },
        { id: 8, amount: '100.000 ₺' },
        { id: 9, amount: '200.000 ₺' },
        { id: 10, amount: '300.000 ₺' },
        { id: 11, amount: '500.000 ₺' },
        { id: 12, amount: '1.000.000 ₺' },
        { id: 13, amount: '5.000.000 ₺' },
      ].reverse(),
    []
  );

  return (
    <div>
      <Navbar />
      <div className="flex flex-col lg:flex-row items-center align-middle justify-center lg:justify-between w-full">
        <div className="align-middle mt-8 lg:ml-5 bg-[#060606]/[0.4] border-4 border-yellow-400 rounded-2xl text-center w-full lg:w-4/5">
          {!isFirstQuestion && (
            <div className="flex justify-center mt-4 pt-2">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-yellow-400 text-black text-xl font-bold">
                {timer}
              </div>
            </div>
          )}
          <div className="flex flex-row justify-end gap-4 p-4 pr-4">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="24"
                viewBox="0 0 24 24"
                fill="white"
              >
                <rect width="24" height="24" fill="black" />
                <text
                  x="12"
                  y="16"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="white"
                >
                  50:50
                </text>
              </svg>
            </div>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="#ffff"
                viewBox="0 0 256 256"
              >
                <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"></path>
              </svg>
            </div>
            <div>
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7.978 4a2.553 2.553 0 0 0-1.926.877C4.233 6.7 3.699 8.751 4.153 10.814c.44 1.995 1.778 3.893 3.456 5.572 1.68 1.679 3.577 3.018 5.57 3.459 2.062.456 4.115-.073 5.94-1.885a2.556 2.556 0 0 0 .001-3.861l-1.21-1.21a2.689 2.689 0 0 0-3.802 0l-.617.618a.806.806 0 0 1-1.14 0l-1.854-1.855a.807.807 0 0 1 0-1.14l.618-.62a2.692 2.692 0 0 0 0-3.803l-1.21-1.211A2.555 2.555 0 0 0 7.978 4Z" />
              </svg>
            </div>
          </div>
          {error && <p>Error: {error}</p>}
          {question ? (
            <div className="mt-10">
              <h2 className="text-xl pb-8 font-extrabold">
                {question.question}
              </h2>
              <div className="grid grid-cols-2 gap-4 mt-8 p-4 font-semibold">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    className={`text-white text-left p-2 rounded-2xl hover:border-4 hover:border-yellow-400 border-4 border-transparent ${
                      selectedOption === option
                        ? isAnswerCorrect
                          ? 'bg-green-500'
                          : 'bg-orange-400'
                        : option === correctAnswer
                        ? 'bg-green-500'
                        : 'bg-gradient-to-b from-custom-blue to-custom-purple/[0.2] border-4 border-blue-700'
                    }`}
                    onClick={() => handleOptionClick(option)}
                    disabled={isOptionDisabled}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {selectedOption && isAnswerCorrect !== null && (
                <div
                  className={`mt-4 p-4 rounded-lg shadow-lg transition-all duration-500 ${
                    isAnswerCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  <p className="text-lg font-semibold">
                    {isAnswerCorrect ? 'Doğru!' : `Yanlış!`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            !error && (
              <div className="mt-10 animate-pulse">
                <h2 className="text-xl p-8 font-extrabold">
                  <Skeleton
                    height={30}
                    baseColor="#202020"
                    highlightColor="#444"
                    borderRadius={12}
                  />
                </h2>
                <div className="grid grid-cols-2 gap-4 mt-8 p-4 font-semibold">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton
                      key={index}
                      height={50}
                      baseColor="#202020"
                      highlightColor="#444"
                      borderRadius={12}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
        <div className="w-full lg:w-1/5 lg:ml-11 lg:pt-11 lg:pr-5 pt-5 flex items-center justify-center">
          <div className="text-center bg-[#000000]/[0.5] rounded-2xl">
            <h2 className="text-2xl xl:text-3xl pb-4 pt-5">Ödül Listesi</h2>
            <ul className="p-5 list-none w-full">
              {moneyPyramid.map((m) => (
                <li
                  key={m.id}
                  className={`flex justify-between items-center p-2 rounded-md ${
                    currentStep === m.id ? 'bg-green-500 text-white' : ''
                  }`}
                >
                  <span className="text-lg font-light">{m.id}</span>
                  <span className="text-sm pl-4 xl:pl-14 font-medium">
                    {m.amount}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-slate-900 p-8 rounded-lg text-center">
              <p className="mb-4">{modalMessage}</p>
              <button
                onClick={handleRestart}
                className="p-2 bg-red-500 text-white rounded mt-4"
              >
                Baştan Başla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
