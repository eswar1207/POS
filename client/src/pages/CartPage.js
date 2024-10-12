import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import {
  DeleteOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Modal, Table, Form, Input, Select, message,Button } from "antd";
const { Option } = Select;

const CartPage = () => {
  const [subtotal, setSubtotal] = useState(0);
  const [form] = Form.useForm();
  const [billPopup, setBillPopup] = useState(false);
  const [invoicePopup, setInvoicePopup] = useState(false);
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.rootReducer);

  const handleIncrement = (record) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { ...record, quantity: record.quantity + 1 },
    });
  };

  const handledcrement = (record) => {
    if (record.quantity !== 1) {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { ...record, quantity: record.quantity - 1 },
      });
    }
  };

  const handleDelete = (record) => {
    dispatch({ type: "DELETE_ITEM_CART", payload: record });
  };

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
      render: (price) => `₹${price}`,
    },
    {
      title: "Quantity",
      dataIndex: "id",
      render: (id, record) => (
        <div>
          <PlusCircleOutlined
            className="mx-3"
            style={{ cursor: "pointer" }}
            onClick={() => handleIncrement(record)}
          />
          <b>{record.quantity}</b>
          <MinusCircleOutlined
            className="mx-3"
            style={{ cursor: "pointer" }}
            onClick={() => handledcrement(record)}
          />
        </div>
      ),
    },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <DeleteOutlined
          onClick={() => handleDelete(record)}
          style={{ cursor: "pointer", color: "red" }}
        />
      ),
    },
  ];

  useEffect(() => {
    const calculateSubtotal = () => {
      const total = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setSubtotal(total);
    };
    calculateSubtotal();
  }, [cartItems]);

const handleCreateInvoice = async (values) => {
  try {
    const taxAmount = subtotal * (values.tax / 100);
    const totalAmount = subtotal + taxAmount;

    const billData = {
      customerName: values.customerName,
      customerPhoneNumber: values.phoneNumber,
      totalAmount,
      tax: taxAmount,
      paymentMethod: values.paymentMethod,
      cartItems,
      userId: "user_id_here", // You need to get this from your authentication system
    };

    const response = await axios.post("/api/bills/add-bill", billData);
    message.success("Invoice created successfully!");
    setBillPopup(false);
    form.resetFields();
    dispatch({ type: "CLEAR_CART" });

    // Print the bill
    printBill(response.data.data);
  } catch (error) {
    console.error("Error creating invoice:", error);
    message.error("Failed to create invoice!");
  }
};
  const printBill = (billData) => {
    const printContent = `
    <html>
      <head>
        <title>Bill</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; width: 80mm; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Invoice</h1>
        <p>Customer: ${billData.customerName}</p>
        <p>Phone: ${billData.customerPhoneNumber}</p>
        <p>Date: ${new Date(billData.date).toLocaleString()}</p>
        <table>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
          ${billData.cartItems
            .map(
              (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price}</td>
              <td>₹${item.price * item.quantity}</td>
            </tr>
          `
            )
            .join("")}
          <tr>
            <td colspan="3">Subtotal:</td>
            <td>₹${billData.totalAmount - billData.tax}</td>
          </tr>
          <tr>
            <td colspan="3">Tax:</td>
            <td>₹${billData.tax}</td>
          </tr>
          <tr>
            <td colspan="3">Total:</td>
            <td class="total">₹${billData.totalAmount}</td>
          </tr>
        </table>
        <p>Payment Method: ${billData.paymentMethod}</p>
      </body>
    </html>
  `;

    const printWindow = window.open("", "", "height=500,width=800");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    } else {
      console.error("Failed to open print window");
      message.error(
        "Failed to open print window. Please check your pop-up blocker settings."
      );
    }
  };
  return (
    <DefaultLayout>
      <h1>Cart</h1>
      <Table columns={columns} dataSource={cartItems} rowKey="_id" />
      <div className="d-flex justify-content-end">
        <h2>Subtotal: ₹{subtotal}</h2>
        <button
          className="btn btn-primary mx-3"
          onClick={() => setBillPopup(true)}
        >
          Generate Bill
        </button>
      </div>
      <Modal
        title="Generate Bill"
        visible={billPopup}
        onCancel={() => setBillPopup(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateInvoice}>
          <Form.Item
            label="Customer Name"
            name="customerName"
            rules={[{ required: true, message: "Please input customer name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            rules={[{ required: true, message: "Please input phone number!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tax (%)"
            name="tax"
            rules={[
              { required: true, message: "Please input tax percentage!" },
            ]}
          >
            <Input type="number" min={0} max={100} />
          </Form.Item>
          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            rules={[
              { required: true, message: "Please select payment method!" },
            ]}
          >
            <Select>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="card">Card</Select.Option>
              <Select.Option value="upi">UPI</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Invoice
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default CartPage;

// eslint-disable-next-line no-unused-expressions
