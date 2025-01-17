//error alert custom component

const  ErrorAlert = ({ data, toastProps }) => {

    const isColored = toastProps.theme === 'colored';

    return (
      <div className="flex flex-col w-full">
        <h3
          className={`text-sm font-semibold ${isColored ? 'text-white' : 'text-zinc-800'}`}
        >
          {data.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm">{data.content}</p>
        </div>
      </div>
    );
}

export default ErrorAlert