/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react"
import Spinner from "./components/spinner"
import { key } from "../config/_key"

function App() {
  const [state, setState] = useState({
    hasError: false,
    isLoading: false,
    page: 1,
  });
  const [data, setData] = useState([]);
  const observerTarget = useRef(null);

  const fetchData = async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true,
      hasError: false,
    }));
    try {
      const response = await fetch(`https://pixabay.com/api/?key=${key}&image_type=photo&page=${state.page}`);
      if (response.ok) {
        const json = await response.json();
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          page: prevState.page + 1,
        }));
        setData((prevData) => {
          const source = [...prevData, ...json.hits];
          const ids = source.map(({ id }) => id);
          const filtered = source.filter(({ id }, index) =>
            !ids.includes(id, index + 1));
          return filtered;
        });
        return;
      }
      throw new Error();
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        hasError: true,
      }));
      return error;
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchData();
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget.current, state.page]);

  return (
    <>
      <header className="head">
        <h1 className="text">Find the best images for your project</h1>
      </header>
      <main className="preview">
        <section className="grid">
          {data && data
            .map(item => (
              <img key={item.id} src={item.previewURL} alt={item.user} className="thumbnail" />
            ))
          }
        </section>
        {state.isLoading && (
          <section className="spinner">
            <Spinner />
            <h2 className="text">Loading...</h2>
          </section>
        )}
        {state.hasError && (
          <section className="error">
            <h2 className="text">Error: No results founded.</h2>
          </section>
        )}
        <div ref={observerTarget}></div>
      </main>
      <footer className="foot">
        <h3 className="text">
          All images from &nbsp;
          <a href="https://pixabay.com/" target="_blank" rel="noreferrer" className="link">Pixabay</a>
          &nbsp; go and support them.
        </h3>
      </footer>
    </>
  )
}

export default App
