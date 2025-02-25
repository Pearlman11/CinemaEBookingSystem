import React from "react";
import MovieCard from "@/app/components/movieCard/MovieCard";
import styles from "./AdminHome.module.css";

const AdminHome: React.FC = () => {
  return (
    <div>
      <div className={styles.container}>
        <h1>Welcome to the Admin Dashboard</h1>
        <button className={styles.addButton}>Add Movie</button>
      </div>
      <MovieCard />
    </div>
  );
};

export default AdminHome;
