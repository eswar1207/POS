import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import DefaultLayout from "../components/DefaultLayout";
import { Button, Form, Modal, Table, Select, Input } from "antd";
import axios from "axios";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import "../styles/ItemPage.css";

const ItemPage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [popupModal, setPopupModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedItem, setSelectedItem] = useState({});
  const dispatch = useDispatch();
  useEffect(() => {
    const getAllItems = async () => {
      try {
        const { data } = await axios.get("/api/items/get-item");
        setItemsData(data);
        const categories = [...new Set(data.map((item) => item.category))];
        setCategories(categories);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    getAllItems();
  }, []);

  // Dynamically update form fields when editing an item
  useEffect(() => {
    if (editModal) {
      editForm.setFieldsValue({
        name: selectedItem.name,
        price: selectedItem.price,
        image: selectedItem.image,
        category: selectedItem.category,
      });
    }
  }, [selectedItem, editModal, editForm]);

  const columns = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Image",
      dataIndex: "image",
      render: (image, record) => (
        <img src={image} alt={record.name} height="60" width="60" />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => `₹${price}`, // Add rupee sign to the price
    },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <DeleteOutlined
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => handleDelete(record)}
          />
          <EditOutlined
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => handleEdit(record)}
          />
        </div>
      ),
    },
  ];

  const handleAddItem = async () => {
    try {
      const values = form.getFieldsValue();
      const newItem = {
        name: values.name,
        price: values.price,
        image: values.image,
        category: selectedCategory || newCategory,
      };

      // Check if an item with the same name already exists
      const existingItem = itemsData.find((item) => item.name === newItem.name);
      if (existingItem) {
        alert("Item with the same name already exists");
        return;
      }

      await axios.post("/api/items/add-item", newItem);
      setItemsData([...itemsData, newItem]);
      setPopupModal(false);
      form.resetFields(); // Reset form after successful submission
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (record) => {
    setSelectedItem(record);
    setEditModal(true);
    editForm.setFieldsValue(record); // Set the form fields to the record values
  };

const handleUpdateItem = async () => {
  try {
    const values = editForm.getFieldsValue();
    const updatedItem = {
      ...selectedItem,
      name: values.name,
      price: values.price,
      image: values.image,
      category: editForm.getFieldValue("category"), // Use editForm.getFieldValue('category') instead of values.category
    };

    console.log(updatedItem); // Log the updatedItem object

    const response = await axios.put(
      `/api/items/edit-item/${selectedItem._id}`,
      updatedItem
    );
    console.log(response); // Log the API response

    setItemsData(
      itemsData.map((item) =>
        item._id === selectedItem._id ? updatedItem : item
      )
    );
    setEditModal(false);
    editForm.resetFields();
  } catch (error) {
    console.log(error);
  }
};
 const handleDelete = async (record) => {
   try {
     await axios.delete(`/api/items/delete-item/${record._id}`);
     setItemsData(itemsData.filter((item) => item._id !== record._id));
   } catch (error) {
     console.log(error);
   }
 };

  return (
    <DefaultLayout>
      <div className="itempages-head">
        <h1>Items</h1>
        <button className="navbut1" onClick={() => setPopupModal(true)}>
          <PlusCircleOutlined
            className="iconaddtocart"
            style={{ cursor: "pointer" }}
          />
          Add Item
        </button>
      </div>

      {/* Items Table */}
      <Table columns={columns} dataSource={itemsData} rowKey="_id" />

      {/* Modal for Adding New Item */}
      <Modal
        title="Add New Item"
        visible={popupModal} // Using 'visible' for Ant Design v4
        onCancel={() => {
          setPopupModal(false);
          form.resetFields(); // Reset form when closing the modal
        }}
        footer={null} // No default footer
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleAddItem}
          initialValues={{
            name: "",
            price: "",
            image: "",
          }}
        >
          <Form.Item name="name" label="Name">
            <Input placeholder="Enter item name" />
          </Form.Item>
          <Form.Item name="image" label="Image URL">
            <Input placeholder="Enter item image URL" />
          </Form.Item>
          <Form.Item name="price" label="Price">
            <Input placeholder="Enter item price" />
          </Form.Item>
          <Form.Item label="Category">
            {categories.length > 0 ? (
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                style={{ width: "100%" }}
              >
                {categories.map((category) => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <p>Loading categories...</p>
            )}
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Or enter a new category"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Add Item
          </Button>
        </Form>
      </Modal>

      {/* Modal for Editing Existing Item */}
      <Modal
        title="Edit Item"
        visible={editModal} // Using 'visible' for Ant Design v4
        onCancel={() => {
          setEditModal(false);
          editForm.resetFields(); // Reset form when closing the modal
        }}
        footer={null} // No default footer
      >
        <Form
          layout="vertical"
          form={editForm}
          onFinish={handleUpdateItem}
          initialValues={{
            name: selectedItem.name,
            price: selectedItem.price,
            image: selectedItem.image,
            category: selectedItem.category,
          }}
        >
          <Form.Item name="name" label="Name">
            <Input placeholder="Enter item name" />
          </Form.Item>
          <Form.Item name="image" label="Image URL">
            <Input placeholder="Enter item image URL" />
          </Form.Item>
          <Form.Item name="price" label="Price">
            <Input placeholder="Enter item price" />
          </Form.Item>
          <Form.Item label="Category">
            {categories.length > 0 ? (
              <Select
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value);
                  editForm.setFieldsValue({ category: value });
                }}
                style={{ width: "100%" }}
              >
                {categories.map((category) => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <p>Loading categories...</p>
            )}
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Update Item
          </Button>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default ItemPage;
