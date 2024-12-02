import React from 'react';
import { useState } from 'react';
import classNames from 'classnames';

import './FindMovie.scss';
import { MovieCard } from '../MovieCard';
import { getMovie } from '../../api';
import { Movie } from '../../types/Movie';

type Props = {
  movieList: Movie[];
  onMovieListChange: (arg: Movie) => void;
};

export const FindMovie: React.FC<Props> = ({
  movieList,
  onMovieListChange,
}) => {
  const [query, setQuery] = useState('');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(false);
  const DEFAULT = {
    PICTURE: 'https://via.placeholder.com/360x270.png?text=no%20preview',
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const normalizeQuery = event.target.value.trim().toLowerCase();

    setQuery(normalizeQuery);
    setHasError(false);
  };

  const handleSearch = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    getMovie(query)
      .then(response => {
        setLoading(true);
        if ('Error' in response) {
          setHasError(true);
        } else {
          setMovie({
            title: response.Title,
            description: response.Plot,
            imgUrl:
              response.Poster === 'N/A' ? DEFAULT.PICTURE : response.Poster,
            imdbId: response.imdbID,
            imdbUrl: response.imdbID,
          });
        }
      })
      .finally(() => setLoading(false));
  };

  const handleMovieListChange = (newMovie: Movie) => {
    const movieExist = movieList.some(
      currentMovie => currentMovie.imdbId === newMovie.imdbId,
    );

    if (!movieExist) {
      onMovieListChange(newMovie);
    }

    setQuery('');
  };

  return (
    <>
      <form className="find-movie">
        <div className="field">
          <label className="label" htmlFor="movie-title">
            Movie title
          </label>

          <div className="control">
            <input
              data-cy="titleField"
              type="text"
              id="movie-title"
              placeholder="Enter a title to search"
              className={classNames('input', { 'is-danger': hasError })}
              value={query}
              onChange={event => handleInputChange(event)}
            />
          </div>

          {hasError && (
            <p className="help is-danger" data-cy="errorMessage">
              Can&apos;t find a movie with such a title
            </p>
          )}
        </div>

        <div className="field is-grouped">
          <div className="control">
            <button
              data-cy="searchButton"
              type="submit"
              className={classNames('button is-light', {
                'is-loading': loading,
              })}
              disabled={!query && true}
              onSubmit={event => handleSearch(event)}
            >
              {hasError ? 'Search again' : 'Find a movie'}
            </button>
          </div>

          {movie && (
            <div className="control">
              <button
                data-cy="addButton"
                type="button"
                className="button is-primary"
                onClick={() => handleMovieListChange(movie)}
              >
                Add to the list
              </button>
            </div>
          )}
        </div>
      </form>

      {movie && (
        <div className="container" data-cy="previewContainer">
          <h2 className="title">Preview</h2>
          <MovieCard movie={movie} />
        </div>
      )}
    </>
  );
};
