import React from "react";
import MovieCard from "@/app/components/movieCard/MovieCard";
import styles from "./AdminHome.module.css";
import {useRouter} from "next/navigation";

const AdminHome: React.FC = () => {
  const router = useRouter(); 

  const handleAddMovieClick = () => {
    router.push("/admin/manage/movies/addMovie"); // Navigate to addMovie page
  };

  return (
    <div>
      <div className={styles.container}>
        <h1>Welcome to the Admin Dashboard</h1>
        <button className={styles.addButton} onClick={handleAddMovieClick}>
          Add Movie
        </button>
      </div>
      <MovieCard />
    </div>
  );
};

export default AdminHome;