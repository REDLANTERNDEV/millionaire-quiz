import { useCallback, useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
            `Yanlış cevap! Doğru cevap: ${data.answer}. Baştan başlamak için butona tıklayın.`
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
    setIsFirstQuestion(false);
    setShowModal(false);
    setError(null);
    setIsTimerRunning(true);
    setQuestionId(null);
    setQuestion(null); // Reset the question
    fetchQuestion(); // Fetch a new question
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
    <div className="flex flex-row lg:flex-col items-center align-middle justify-center">
      <div className="align-middle text-center w-full lg:w-1/2">
        <h1 className="text-3xl">KMOİ Hg</h1>
        {error && <p>Error: {error}</p>}
        {question ? (
          <div className="mt-10">
            <h2 className="text-xl p-8 font-extrabold">{question.question}</h2>
            <div className="grid grid-cols-2 gap-4 mt-8 p-4 font-semibold">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`bg-black text-white text-left p-2 rounded-lg hover:border-4 hover:border-yellow-400 border-4 border-transparent ${
                    selectedOption === option
                      ? isAnswerCorrect
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      : option === correctAnswer
                      ? 'bg-green-500'
                      : ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                  disabled={isOptionDisabled}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedOption && (
              <p className="mt-4">
                {isAnswerCorrect
                  ? 'Doğru!'
                  : `Yanlış! Doğru cevap: ${correctAnswer}`}
              </p>
            )}
            {!isFirstQuestion && (
              <p className="mt-4">Kalan Süre: {timer} saniye</p>
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
      <div className="w-full lg:w-1/2 pt-11 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl lg:text-3xl mb-4">Ödül Listesi</h2>
          <ul className="p-5 list-none w-full">
            {moneyPyramid.map((m) => (
              <li
                key={m.id}
                className={`flex justify-between items-center p-2 rounded-md ${
                  currentStep === m.id ? 'bg-green-500 text-white' : ''
                }`}
              >
                <span className="text-lg font-light">{m.id}</span>
                <span className="text-lg pl-14 font-medium">{m.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg text-center">
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
  );
}

export default App;
