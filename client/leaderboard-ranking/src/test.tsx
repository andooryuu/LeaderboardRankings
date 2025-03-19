import React, { useState, useEffect } from "react";

function Test() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch(`http://localhost:5000/player/quickdraw/activities`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
      });
  }, []);

  return <div>Test</div>;
}
export default Test;
