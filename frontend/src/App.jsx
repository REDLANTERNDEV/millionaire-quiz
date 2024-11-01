import { useEffect, useMemo, useState } from 'react';

function App() {
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch('http://localhost:3000/question/1');
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
  }, []);

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
                  className="bg-black text-white text-left p-2 rounded-lg hover:border-4 hover:border-yellow-400 border-4 border-transparent"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="basis-3/4 pt-5 justify-center items-center flex font-extrabold text-4xl">
        <ul className="text-left whitespace-nowrap">
          {moneyPyramid.map((m) => (
            <li key={m.id}>
              <span className="pr-14">{m.id}</span>
              <span className="moneyListItemAmount">{m.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
