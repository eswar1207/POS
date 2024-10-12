import React, { useState, useEffect } from "react";
import DefaultLayout from "./../components/DefaultLayout";
import axios from "axios";
import { Col, Row, Button } from "antd";
import ItemList from "../components/ItemList";
import "../styles/Homepage.css";
const Homepage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const getAllItems = async () => {
      try {
        const { data } = await axios.get("/api/items/get-item");
        setItemsData(data);
        const uniqueCategories = [
          "all",
          ...new Set(data.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.log(error);
      }
    };
    getAllItems();
  }, []);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Filter items based on the selected category
  const filteredItems =
    selectedCategory === "all"
      ? itemsData
      : itemsData.filter((item) => item.category === selectedCategory);

  return (
    <DefaultLayout>
      <div style={{ marginBottom: 20 }}>
        {categories.map((category) => (
          <Button
            key={category}
            className={
              selectedCategory === category ? "navbut1 active" : "navbut1"
            }
            onClick={() => handleCategoryChange(category)}
            style={{ marginRight: 10 }}
          >
            {category}
          </Button>
        ))}
      </div>
      <Row>
        {filteredItems.map((item) => (
          <Col xs={24} lg={4} md={8} key={item._id}>
            <ItemList item={item} />
          </Col>
        ))}
      </Row>
    </DefaultLayout>
  );
};

export default Homepage;
