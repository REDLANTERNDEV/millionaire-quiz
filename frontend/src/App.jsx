import { useMemo } from 'react';

function App() {
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
        <div className="mt-10">
          <h2 className="text-xl p-8 font-extrabold">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa, enim
            odio obcaecati voluptatibus consectetur exercitationem illum
            perferendis incidunt quibusdam numquam labore quaerat illo, quod
            explicabo. Voluptatibus maiores sint asperiores beatae?
          </h2>
          <div className="grid grid-cols-2 gap-4 mt-8 p-4 font-semibold">
            <button className="bg-black text-white text-left p-2 rounded-lg hover:border-4 hover:border-yellow-400 border-4 border-transparent">
              A: Aydın
            </button>
            <button className="bg-black text-white text-left p-2 rounded-lg hover:border-4 hover:border-yellow-400 border-4 border-transparent">
              B
            </button>
            <button className="bg-black text-white text-left p-2 rounded-lg hover:border-4 hover:border-yellow-400 border-4 border-transparent">
              C
            </button>
            <button className="bg-black text-white text-left p-2 rounded-lg hover:border-4 hover:border-yellow-400 border-4 border-transparent">
              D
            </button>
          </div>
        </div>
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
