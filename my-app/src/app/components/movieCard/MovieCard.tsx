"use client";
import React, { useState } from "react";
import Image from "next/image";
import style from "./MovieCard.module.css";
import { useAuth } from "@/app/context/AuthContext";

/**
 *  Defined the movie interface to represent a single movie
 */
interface showTimes {
  date: string;
  time: string;
  theatre: string;
}

interface Movie {
  title: string;
  showTimes: showTimes[];
  filmRatingCode: string;
  trailer: string;
  poster: string;
  category: string;
  // new additions
  cast: string[];
  director: string;
  producer: string;
  reviews: string[];
  description: string;
}

export default function MovieCard() {
  const dummyMovies: Movie[] = [
    {
      title: "The Monkey",
      showTimes: [
        { date: "02/21/2025", theatre: "AMC The Grove 14", time: "2:30 PM" },
      ],
      filmRatingCode: "R",
      trailer: "https://www.youtube.com/watch?v=1jc0KjSiXb0",
      poster: "https://www.impawards.com/2025/posters/monkey_ver2_xlg.jpg",
      category: "Now playing",
      cast: [
        "Theo James",
        "Elijah Wood",
        "Tatiana Maslany",
        "Christian Convery",
      ],
      director: "Osgood Perkins",
      producer: "James Wan",
      reviews: [
        "The Monkey is 90 minutes of pure bloody, comedic horror gold. The opening scene of the film perfectly sets the tone for the insanity ahead...",
        "A gory, surprisingly existential horror comedy that embraces Perkins’ silly side.",
      ],
      description:
        "Twin brothers Hal and Bill discover a cursed toy monkey in their attic that triggers a series of gruesome deaths, forcing them to confront their past and stop the bloodshed.",
    },
    {
      title: "Flight Risk",
      showTimes: [
        { date: "02/21/2025", theatre: "Regal LA Live", time: "4:45 PM" },
      ],
      filmRatingCode: "R",
      trailer: "https://www.youtube.com/watch?v=Cml3CFDBj2s",
      poster:
        "https://assets.voxcinemas.com/posters/P_HO00011875_1736503368670.jpg",
      category: "Now playing",
      cast: [
        "Mark Wahlberg",
        "Michelle Dockery",
        "Topher Grace",
        "Jonathan Sadowski",
      ],
      director: "Mel Gibson",
      producer: "John Davis",
      reviews: [
        "Flight Risk was surprisingly better than I expected. To truly get the full experience of this movie, I highly recommend watching it in 4DX...",
        "The immersive effects add an extra layer of excitement that elevates the viewing experience.",
      ],
      description:
        "A pilot transporting a fugitive across Alaska finds himself entangled in a deadly game of trust and survival when secrets unravel mid-flight.",
    },
    {
      title: "Longlegs",
      showTimes: [
        { date: "02/21/2025", theatre: "AMC The Grove 14", time: "7:00 PM" },
      ],
      filmRatingCode: "R",
      trailer: "https://www.youtube.com/watch?v=OG7wOTE8NhE",
      poster:
        "https://yc.cldmlk.com/q201nsmb396zm2anq05v95jfh4/1719341480737_Poster.jpg",
      category: "Now Playing",
      cast: ["Maika Monroe", "Nicolas Cage", "Blair Underwood", "Alicia Witt"],
      director: "Osgood Perkins",
      producer: "Jennifer Sharp",
      reviews: [
        "A chilling and atmospheric horror film that delivers on its premise.",
        "Nicolas Cage gives a standout performance as the titular character.",
        "The movie's slow burn and moody atmosphere make it a must-watch for horror fans.",
      ],
      description:
        "FBI agent Lee Harker investigates a series of occult-driven murders, uncovering a chilling connection to a sinister figure known as Longlegs.",
    },
    {
      title: "The Substance",
      showTimes: [
        { date: "02/21/2025", theatre: "AMC The Grove 14", time: "5:00 PM" },
      ],
      filmRatingCode: "R",
      trailer: "https://www.youtube.com/watch?v=9N1QHUePOZg",
      poster:
        "https://resizing.flixster.com/_QxKcVaMHyrRdxfixHJWMuA4OCs=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p27412556_v_v13_ag.jpg",
      category: "Now Playing",
      cast: [
        "Demi Moore",
        "Margaret Qualley",
        "Dennis Quaid",
        "Edward Hamilton-Clark",
      ],
      director: "Coralie Fargeat",
      producer: "Jennifer Sharp",
      reviews: [
        "A bold and uncompromising exploration of fame and self-hatred.",
        "Demi Moore delivers a career-defining performance.",
        "The film's graphic content and intense themes may not be for the faint of heart, but it's a riveting watch nonetheless.",
      ],
      description:
        "A fading actress uses a black-market drug to create a younger version of herself, sparking a grotesque battle of identity and survival.",
    },
    {
      title: "Captain America: Brave New World",
      showTimes: [
        { date: "02/21/2025", theatre: "Cinemark Century 16", time: "6:00 PM" },
      ],
      filmRatingCode: "PG-13",
      trailer: "https://www.youtube.com/watch?v=O_AcR5YkU5Y",
      poster:
        "https://m.media-amazon.com/images/M/MV5BNDRjY2E0ZmEtN2QwNi00NTEwLWI3MWItODNkMGYwYWFjNGE0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
      category: "Now Playing",
      cast: [
        "Anthony Mackie",
        "Harrison Ford",
        "Liv Tyler",
        "Giancarlo Esposito",
      ],
      director: "Julius Onah",
      producer: "Kevin Feige",
      reviews: [
        "Anthony Mackie shines as the new Cap in this thrilling MCU entry.",
        "A solid mix of action and political intrigue, though it stumbles at times.",
      ],
      description:
        "Sam Wilson, now Captain America, faces a global conspiracy involving a new Hulk and a shadowy government plot threatening world order.",
    },
    {
      title: "Love Hurts",
      showTimes: [
        { date: "02/21/2025", theatre: "Regal LA Live", time: "3:15 PM" },
      ],
      filmRatingCode: "R",
      trailer: "https://www.youtube.com/watch?v=5i5y2J6QJtw",
      poster:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRGs7x6896Z02PnxJYap9MILWYV4xkxTh6poa8ITQSMcurlTqHbaosqsbulsGx4dBNID_GW3Q",
      category: "Now Playing",
      cast: ["Ke Huy Quan", "Ariana DeBose", "Sean Astin", "Daniel Wu"],
      director: "Jonathan Eusebio",
      producer: "David Leitch",
      reviews: [
        "Ke Huy Quan brings charm and action chops to this surprising hit.",
        "A fun blend of comedy and high-octane fight scenes.",
      ],
      description:
        "A retired hitman is pulled back into the underworld when his past catches up, blending action and humor in a fight for redemption.",
    },
    {
      title: "Wolf Man",
      showTimes: [
        { date: "02/21/2025", theatre: "AMC Century City 15", time: "8:30 PM" },
      ],
      filmRatingCode: "R",
      trailer: "https://www.youtube.com/watch?v=Wx0WVRj4NLo",
      poster:
        "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRT-HEr36ZOpfJfwO0FxT_6SBEBYSCj3f8wp4idlO9n5gq40Vc-NRPKJJtoT88_uZ73K9YRXA",
      category: "Now Playing",
      cast: ["Christopher Abbott", "Julia Garner", "Matilda Firth"],
      director: "Leigh Whannell",
      producer: "Jason Blum",
      reviews: [
        "A chilling take on the werewolf myth with strong performances.",
        "More psychological than scary, but body horror fans will enjoy it.",
      ],
      description:
        "A man retreats to a remote cabin with his family, only to transform into a werewolf after a mysterious attack, testing their bonds.",
    },
    {
      title: "Paddington in Peru",
      showTimes: [
        { date: "02/21/2025", theatre: "Cinemark Century 16", time: "1:00 PM" },
      ],
      filmRatingCode: "PG",
      trailer: "https://www.youtube.com/watch?v=WIaD96vMr-4",
      poster:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTrMxSS2grExGZcVeZDPQ17LpW9LE82Z5Xsg0fLy912gLGd2t80R4Z_33USzP4syjYyhYkE",
      category: "Now Playing",
      cast: [
        "Ben Whishaw",
        "Hugh Bonneville",
        "Emily Mortimer",
        "Antonio Banderas",
      ],
      director: "Dougal Wilson",
      producer: "David Heyman",
      reviews: [
        "A delightful family adventure with Paddington’s signature charm.",
        "Antonio Banderas steals the show as a quirky explorer.",
      ],
      description:
        "Paddington travels to Peru to visit Aunt Lucy, leading the Brown family on a hilarious adventure filled with marmalade and mystery.",
    },
    {
      title: "Mufasa: The Lion King",
      showTimes: [
        { date: "02/21/2025", theatre: "AMC The Grove 14", time: "4:00 PM" },
      ],
      filmRatingCode: "PG",
      trailer: "https://www.youtube.com/watch?v=xYdpMnAHH7E",
      poster:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd80_TDMj7k1WXRdmTMIkGQKIHaKJ65LEynv4EOSsAguQ3Crx0Yz-IZSmN197SWQfd0Eps",
      category: "Now Playing",
      cast: [
        "Aaron Pierre",
        "Kelvin Harrison Jr.",
        "Tiffany Boone",
        "Donald Glover",
      ],
      director: "Barry Jenkins",
      producer: "Adele Romanski",
      reviews: [
        "A visually stunning prequel that adds depth to Mufasa’s story.",
        "Barry Jenkins brings emotional weight to this Disney classic.",
      ],
      description:
        "This prequel explores Mufasa’s rise to becoming the king of the Pride Lands, revealing his journey from orphan to legendary ruler.",
    },
    {
      title: "Heart Eyes",
      showTimes: [
        { date: "02/21/2025", theatre: "Regal LA Live", time: "9:00 PM" },
      ],
      filmRatingCode: "R",
      trailer: "https://www.youtube.com/watch?v=heart-eyes-trailer",
      poster:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKNvO907USIahlmbkMZ3-nWrR8PMC-QEhV6ggOe5Mql8wOnAdfJGUkzOZqzq2UY_UFQOzx",
      category: "Now Playing",
      cast: ["Devon Sawa", "Gigi Zumbado", "Olivia Holt", "Jordana Brewster"],
      director: "Josh Ruben",
      producer: "Eddie Rubin",
      reviews: [
        "A bloody Valentine’s Day romp that’s equal parts funny and gory.",
        "Perfect for horror fans who love a twist of romance.",
      ],
      description:
        "Two co-workers fake a romance to survive a Valentine’s Day killing spree, only to face real horrors from a lovesick slasher.",
    },
    {
      title: "Better Man",
      showTimes: [
        { date: "02/21/2025", theatre: "AMC Century City 15", time: "6:45 PM" },
      ],
      filmRatingCode: "R",
      trailer: "https://www.youtube.com/watch?v=better-man-trailer",
      poster:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQipF3l9hAg23E75njSPvHmaw6rsw1u7ekMsaT4VmPCXiYBg-HWjfWd47u3RB8Vf7gHjIbRyA",
      category: "Now Playing",
      cast: [
        "Jonno Davies",
        "Robbie Williams",
        "Kate Mulvany",
        "Damon Herriman",
      ],
      director: "Michael Gracey",
      producer: "Paul Currie",
      reviews: [
        "A wild musical biopic with Robbie Williams as a CGI chimp!",
        "Gracey’s flair makes this a standout in the genre.",
      ],
      description:
        "Robbie Williams’ life unfolds as a surreal musical, with a CGI monkey narrating his rise, fall, and redemption in showbiz.",
    },
    {
      title: "Bring Them Down",
      showTimes: [
        { date: "02/21/2025", theatre: "Cinemark Century 16", time: "7:30 PM" },
      ],
      filmRatingCode: "R",
      trailer: "https://www.youtube.com/watch?v=bring-them-down-trailer",
      poster:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKtos7Aifvbp7dx671BpQc8KASg0Mik_4v9A&s",
      category: "Now Playing",
      cast: [
        "Christopher Abbott",
        "Barry Keoghan",
        "Colm Meaney",
        "Paul Ready",
      ],
      director: "Christopher Andrews",
      producer: "Ivana MacKinnon",
      reviews: [
        "A tense rural thriller with standout performances.",
        "Dark secrets unravel in this gripping debut.",
      ],
      description:
        "Two rival farming families clash over stolen livestock, igniting a violent feud that unearths buried trauma and betrayal.",
    },
  ];

  const [movies, setMovies] = useState<Movie[]>(dummyMovies);
  const { isAdmin } = useAuth();
  const [flipped, setFlipped] = useState<number[]>([]); // used to track if a card is flipped

  const handleCardFlip = (index: number) => {
    setFlipped((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className={style.container}>
      {movies.map((movie, movieIndex) => (
        <div className={style.movie} key={movieIndex}>
          <div className={style.posterContainer}>
            <Image
              src={movie.poster}
              alt={`Poster for ${movie.title}`}
              fill
              className={style.posterImg}
              quality={100}
            />
          </div>
          <div className={style.movieinfocontainer}>
            <div className={style.titleRatingContainer}>
              <p className={style.title}>{movie.title}</p>
              <p className={style.category}>{movie.category}</p>
              <p className={style.filmRatingCode}>
                Rating: {movie.filmRatingCode}
              </p>
            </div>
            <div
              className={`${style.flipContainer} ${
                flipped.includes(movieIndex) ? style.flipped : ""
              }`}
              onClick={() => handleCardFlip(movieIndex)}
            >
              {/* Front Side */}
              <div className={style.front}>
                <div className={style.additionalInfo}>
                  <strong>Showtimes:</strong>
                  {movie.showTimes.map((show, idx) => (
                    <p key={idx}>
                      {show.date} at {show.time} - {show.theatre}
                    </p>
                  ))}
                </div>
              </div>
              {/* Back Side */}
              <div className={style.front}>
                <div className={style.additionalInfo}>
                  <strong>Showtimes:</strong>
                  {movie.showTimes.map((show, idx) => (
                    <p key={idx}>
                      {show.date} at {show.time} - {show.theatre}
                    </p>
                  ))}
                </div>
              </div>
              <div className={style.back}>
                <div className={style.additionalInfo}>
                  <div className={style.productionCrew}>
                    <p>
                      <strong>Director:</strong> {movie.director}
                    </p>
                    <p>
                      <strong>Producer:</strong> {movie.producer}
                    </p>
                    <p>
                      <strong>Cast:</strong> {movie.cast.join(", ")}
                    </p>
                  </div>
                  <div className={style.reviews}>
                    <p>
                      <strong>Description:</strong>
                      <p>{movie.description}</p>
                    </p>
                    <strong>Reviews:</strong>
                    {movie.reviews.map((review, reviewIndex) => (
                      <p key={reviewIndex}>{review}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className={style.adminControls}>
              <button className={style.editButton}>Edit</button>
              <button className={style.deleteButton}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
