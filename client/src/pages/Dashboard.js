import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { Card, Row, Col, Avatar, Table, Statistic } from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [topSales, setTopSales] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [prediction, setPrediction] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        salesResponse,
        topSalesResponse,
        topCustomersResponse,
        profileResponse,
        predictionResponse,
      ] = await Promise.all([
        axios.get("/api/dashboard/sales-data"),
        axios.get("/api/dashboard/top-sales"),
        axios.get("/api/dashboard/top-customers"),
        axios.get("/api/dashboard/user-profile"),
        axios.get("/api/dashboard/sales-prediction"),
      ]);

      setSalesData(salesResponse.data);
      setTopSales(topSalesResponse.data);
      setTopCustomers(topCustomersResponse.data);
      setUserProfile(profileResponse.data);
      setPrediction(predictionResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const topSalesColumns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (text) => `$${text.toFixed(2)}`,
    },
  ];

  const topCustomersColumns = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Total Purchase",
      dataIndex: "totalPurchase",
      key: "totalPurchase",
      render: (text) => `$${text.toFixed(2)}`,
    },
  ];

  return (
    <DefaultLayout>
      <h1>Dashboard</h1>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="Sales Overview">
            {/* Replace this with a different chart library or component */}
            <p>Sales chart will be displayed here</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="User Profile">
            <Avatar size={64} icon={<UserOutlined />} />
            <h2>{userProfile.name}</h2>
            <p>{userProfile.email}</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top Sales">
            <Table dataSource={topSales} columns={topSalesColumns} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top Customers">
            <Table dataSource={topCustomers} columns={topCustomersColumns} />
          </Card>
        </Col>
        <Col span={16}>
          <Card title="Sales Prediction">
            <Statistic title="Predicted Sales" value={prediction.value} />
          </Card>
        </Col>
      </Row>
    </DefaultLayout>
  );
};

export default Dashboard;
