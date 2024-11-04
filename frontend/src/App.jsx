import { useEffect, useMemo, useState } from 'react';

function App() {
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [isOptionDisabled, setIsOptionDisabled] = useState(false);
  const [GetId, setGetId] = useState(1);
  const [timer, setTimer] = useState(60);
  const [isFirstQuestion, setIsFirstQuestion] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`http://localhost:3000/question/${GetId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setQuestion(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchQuestion();
  }, [GetId]);

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
          `http://localhost:3000/answer/${question.id}`,
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
          setTimeout(() => {
            handleNextQuestion();
          }, 1000);
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
    setGetId((prevId) => prevId + 1);
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setIsOptionDisabled(false);
    setCorrectAnswer(null);
    setTimer(60);
    setIsFirstQuestion(false);
    setIsTimerRunning(true);
  };

  const handleRestart = () => {
    setGetId(1);
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setIsOptionDisabled(false);
    setCorrectAnswer(null);
    setTimer(60);
    setIsFirstQuestion(true);
    setShowModal(false);
    setError(null);
    setIsTimerRunning(true);
  };

  const moneyPyramid = useMemo(
    () =>
      [
        { id: 1, amount: '$ 100' },
        { id: 2, amount: '$ 200' },
        { id: 3, amount: '$ 300' },
        { id: 4, amount: '$ 500' },
        { id: 5, amount: '$ 1.000' },
        { id: 6, amount: '$ 2.000' },
        { id: 7, amount: '$ 4.000' },
        { id: 8, amount: '$ 8.000' },
        { id: 9, amount: '$ 16.000' },
        { id: 10, amount: '$ 32.000' },
        { id: 11, amount: '$ 64.000' },
        { id: 12, amount: '$ 125.000' },
        { id: 13, amount: '$ 250.000' },
        { id: 14, amount: '$ 500.000' },
        { id: 15, amount: '$ 1.000.000' },
      ].reverse(),
    []
  );

  return (
    <div className="flex lg:flex-row flex-col">
      <div className="align-middle text-center">
        <h1 className="text-3xl">Sorular</h1>
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
          !error && <p>Loading...</p>
        )}
      </div>
      <div className="w-1/4 flex items-center justify-center">
        <ul className="p-5 list-none w-full">
          {moneyPyramid.map((m) => (
            <li key={m.id} className="flex items-center p-1 rounded-md">
              <span className="w-1/3 text-lg font-light mr-1">{m.id}</span>
              <span className="text-xl font-medium">{m.amount}</span>
            </li>
          ))}
        </ul>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="mb-4">{modalMessage}</p>
            <button
              onClick={handleRestart}
              className="p-2 bg-blue-500 text-white rounded"
            >
              Başa Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
