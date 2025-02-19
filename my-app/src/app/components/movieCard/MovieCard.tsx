"use client";
import React, { useState } from "react";
import Image from "next/image";
import style from './MovieCard.module.css'

/**
 *  *Defined the movie interface to represent a single movie
 */
interface showTimes {
  date: string;
  time: string;
  theatre: string;
}

interface Movie {
  title: string;
  showTimes: showTimes[];
  rating: string;
  trailer: string;
  poster: string;
  status: string;
}

const MovieCard: React.FC = () => {
  const dummyMovies: Movie[] = [
    {
      title: "The Monkey",
      showTimes: [
        { date: "02/19/2025", theatre: "B&B Athens 12", time: "2:30" },
      ],
      rating: "R",
      trailer: "https://www.youtube.com/watch?v=1jc0KjSiXb0",
      poster:
        "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTtuVqZcsgiW40-ZcD-PH_Ce-oIwuxcjYFQ55Tw0TNRHZZo7vYu",
      status: "Now playing",
    },
    {
      title: "The Monkey",
      showTimes: [
        { date: "02/19/2025", theatre: "University 16 cinemas", time: "4:45" },
      ],
      rating: "R",
      trailer: "https://www.youtube.com/watch?v=Cml3CFDBj2s",
      poster:
        "https://assets.voxcinemas.com/posters/P_HO00011875_1736503368670.jpg",
      status: "Now playing",
    },
  ];
  //* state to keep track of list of exercises
  const [movies, setMovies] = useState<Movie[]>(dummyMovies);


  return (
    <div className={style.container}>
      {movies.map((movie, movieIndex) => (
        <div className={style.movie} key={movieIndex}>
          <div className={style.posterContainer}>
          <Image
            src={movie.poster}
            alt="image for movie"
            width={100}
            height={100}
            id={style.poster}
          ></Image>
          </div>
     
          <p id={style.title}> {movie.title}</p>
          <div className={style.movieinfocontainer}>
            <p id={style.status}> {movie.status}</p>
            <p id={style.rating}>Rating: {movie.rating}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieCard;
