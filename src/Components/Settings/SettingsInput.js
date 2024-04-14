const Input = (props) => {
    return <input className="appearance-none block w-full md:w-1/2 bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-100" type="number" placeholder={props.placeholder} defaultValue={props.default} ref={props.reference}></input>
}

export default Input;