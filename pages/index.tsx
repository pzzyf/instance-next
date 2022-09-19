import { memo } from "react";
import styled from "styled-components";
import pciture from "../public/pictures/background.png";
import { Button, Form, Input, notification } from "antd";
import axios from "../node_modules/axios/index";
import { httpHost, wsHOST } from "../network/index";
import io from "socket.io-client";
import { useRouter } from "next/router";

const Home = () => {
  const socket = io(wsHOST);
  const router = useRouter();
  interface FormData {
    username: string;
    password: string;
    confirmPassword: string;
  }

  function passwordIsVaild(formData: FormData) {
    return formData.password === formData.confirmPassword;
  }

  function hasAvatar(username: string) {
    return axios.post(`${httpHost}user/hasavatar`, {
      username,
    });
  }

  function register(values: FormData) {
    return axios.post(`${httpHost}auth/register`, {
      username: values.username,
      password: values.password,
      avatar: `https://api.multiavatar.com/Binx%${Math.floor(
        Math.random() * 50000
      )}.png`,
    });
  }

  async function login(values: FormData) {
    axios.post(`${httpHost}auth/login`, values).then(async (res) => {
      if (res?.data === undefined) {
        notification.error({
          message: "登录失败",
          description: "请检查网络设置",
          duration: 2,
        });
        return;
      }
      if (res?.data?.data?.access_token !== undefined) {
        notification["success"]({
          message: "成功提示",
          description: "您已登陆成功",
          duration: 2,
        });
        socket.emit(
          "connection",
          async (socket: { join: (arg0: string) => any; id: any }) => {
            await socket.join(values.username);
          }
        );
        localStorage.setItem("token", res.data.data.access_token);
        localStorage.setItem("username", values.username);
        let ishasAvatar = await hasAvatar(values.username);
        if (ishasAvatar.data) {
          router.push("/chat");
        } else {
          router.push("/avatar");
        }
      }
    });
  }

  const onFinish = async (values: FormData) => {
    if (passwordIsVaild(values)) {
      let registerRes = await register(values);
      let registerRes1 = registerRes.data;
      if (registerRes1.data.code == 200 || registerRes1.data.code == 1001) {
        login(values);
      }
    } else {
      notification["error"]({
        message: "注意",
        description: "两次输入密码不一致",
      });
    }
  };

  return (
    <Container>
      <img src={pciture.src} />
      <div className="center">
        <div className="content">
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="请输入用户名"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="请输入密码"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="请确认密码"
              name="confirmPassword"
              rules={[
                { required: true, message: "Please confirm your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          <div>新用户未注册会自动注册并登录</div>
        </div>
      </div>
    </Container>
  );
};

export default memo(Home);
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  img {
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: -1;
  }
  .center {
    width: 600px;
    height: 450px;
    position: relative;
    left: 50%;
    top: 50%;
    background: #fff;
    transform: translate(-50%, -50%);
    opacity: 0.5;
    .content {
      position: absolute;
      width: 500px;
      height: 350px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
  }
`;
