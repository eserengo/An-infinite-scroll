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
      const response = await fetch(`https://pixabay.com/api/?key=${key}&image_type=illustration&page=${state.page}`);
      if (response.ok) {
        const json = await response.json();
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          page: prevState.page + 1,
        }));
        json && setData((prevData) => [...prevData, ...json.hits]);
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
      <main className="main">
        <section className="preview">
          { data &&
            data.map(item => (
              <img key={`${state.page}${item.id}`} src={item.previewURL} alt={item.user} className="thumbnail" />
            ))
          }
          <div ref={observerTarget}></div>
        </section>
        { state.isLoading && (
          <section className="spinner">
            <Spinner />
            <h2 className="text">Loading...</h2>
          </section>
        )}
        { state.hasError && (
          <section className="error">
            <h2 className="text">Error: No results found.</h2>
          </section>
        )}
      </main>
    </>
  )
}

export default App
