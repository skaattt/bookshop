import React, { useState } from "react";
import Helmet from "../components/Helmet/Helmet";
import { Container, Row, Col, Form, FormGroup } from "reactstrap";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { setDoc, doc } from "firebase/firestore";

import { auth } from "../firebase.config";
import { storage } from "../firebase.config";
import { db } from "../firebase.config";

import { toast } from "react-toastify";

import "../styles/login.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const signup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = await userCredential.user;

      const storageRef = ref(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        (error) => {
          // Handle unsuccessful uploads
          toast.error(error.message);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateProfile(user, {
              displayName: username,
              photoURL: downloadURL,
            });
            //update user profile

            //store user data in firestore database
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              displayName: username,
              email,
              photoURL: downloadURL,
            });
          });
        }
      );

      setLoading(false);
      toast.success("Аккаунт зарегистрирован");
      navigate("/login");
    } catch (error) {
      setLoading(false);
      toast.error("Произошла ошибка");
    }
  };

  return (
    <Helmet title="Регистрация">
      <section>
        <Container>
          <Row>
            {loading ? (
              <Col lg="12" className="text-center">
                <h5 className="fw-bold">Подождите, идёт загрузка......</h5>
              </Col>
            ) : (
              <Col lg="6" className="m-auto text-center">
                <h3 className="fw-bold mb-4">Регистрация</h3>

                <Form className="auth__form" onSubmit={signup}>
                  <FormGroup className="form__group">
                    <input
                      type="text"
                      placeholder="Имя пользователя"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup className="form__group">
                    <input
                      type="email"
                      placeholder="Введите email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup className="form__group">
                    <input
                      type="password"
                      placeholder="Введите пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup className="form__group">
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </FormGroup>

                  <button type="submit" className="buy__btn auth__btn">
                    Зарегистрироваться
                  </button>
                  <p>
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                  </p>
                </Form>
              </Col>
            )}
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Signup;
