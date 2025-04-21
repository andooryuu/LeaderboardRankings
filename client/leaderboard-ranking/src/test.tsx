import React, { useState, useEffect } from "react";
import Performance from "./components/Performance";

function Test() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("http://localhost:5000/scores")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        console.log(
          data.find((item: any) => {
            if (item.username.includes("Airsoft")) {
              return item.username;
            }
          })
        );
      });
  }, []);

  return <div></div>;
}
export default Test;
