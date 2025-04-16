/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/js/TimeLine.js
class TimeLine {
  constructor(partentEl) {
    this.partentEl = partentEl;
  }
  static get markup() {
    return `
    <div class="time-line">
      <div class="messages-container"></div>
      <input type="text" class="input-messages" />
      <button class="micro-btn">🎤</button>
      <button class="video-btn">🎞️</button>
    </div>
    `;
  }
  static get inputSelector() {
    return `.input-messages`;
  }
  bindToDOM() {
    this.partentEl.innerHTML = this.constructor.markup;
    const input = document.querySelector(this.constructor.inputSelector);
    document.addEventListener("click", e => this.onClickToDoc(e));
    input.addEventListener("keydown", e => this.onKeyDown(e));
  }
  onKeyDown(e) {
    if (e.code === "Enter") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(data => {
          const {
            latitude,
            longitude
          } = data.coords;
          const formattedCoords = `[${latitude}, ${longitude}]`;
          const options = {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric"
          };
          const formattedDate = new Date().toLocaleDateString("ru-RU", options);
          const textMessage = e.target;
          const messageContainer = document.querySelector(".messages-container");
          messageContainer.insertAdjacentHTML("beforeend", `
            <div class="message">
              <div class="text-block">
                <p class="text">
                  ${textMessage.value}
                </p>
                <div class="coords">${formattedCoords}</div>
              </div>
              <div class="date">${formattedDate}</div>
            </div>
            `);
          textMessage.value = "";
        }, () => {
          this.partentEl.insertAdjacentHTML("afterbegin", `
              <div class="modal">
                <h3>Что то пошло не так</h3>
                <p>
                  К сожалению, нам не удалось определить ваше местоположение, пожалуйста,
                  дайте разрешение на использование геолокации, либо введите координаты
                  вручную
                </p>
                <p>Широта и долгота через запятую</p>
                <input type="text" class="coords-input" />
                <div class="btn-block">
                  <button class="cancel">Отмена</button>
                  <button class="ok">ОК</button>
                </div>
              </div>
              `);
          const cancel = document.querySelector(".cancel");
          cancel.addEventListener("click", e => {
            e.target.closest(".modal").remove();
          });
          const okButton = document.querySelector(".ok");
          okButton.addEventListener("click", e => {
            const modal = e.target.closest(".modal");
            const coordsInput = modal.querySelector(".coords-input");
            const coordsInputValue = coordsInput.value;
            const testCaseOne = /^-?\d{1,2}.\d{5}, ?-?\d{1,2}.\d{5}$/gm.test(coordsInputValue);
            const testCaseTwo = /^\[-?\d{1,2}.\d{5}, ?-?\d{1,2}.\d{5}\]$/gm.test(coordsInputValue);
            if (testCaseOne || testCaseTwo) {
              modal.remove();
              const options = {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric"
              };
              const formattedDate = new Date().toLocaleDateString("ru-RU", options);
              const textMessage = document.querySelector(".input-messages");
              const messageContainer = document.querySelector(".messages-container");
              messageContainer.insertAdjacentHTML("beforeend", `
                    <div class="message">
                      <div class="text-block">
                        <p class="text">
                          ${textMessage.value}
                        </p>
                        <div class="coords">${coordsInputValue}</div>
                      </div>
                      <div class="date">${formattedDate}</div>
                    </div>
                    `);
              textMessage.value = "";
            } else {
              coordsInput.value = "Введите верные координаты";
              coordsInput.setAttribute("disabled", true);
              setTimeout(() => {
                coordsInput.value = "";
                coordsInput.removeAttribute("disabled");
              }, 1000);
            }
          });
        });
      }
    }
  }
  async onClickToDoc(e) {
    if (e.target.classList.contains("micro-btn")) {
      if (navigator.mediaDevices) {
        try {
          e.target.nextElementSibling.remove();
          e.target.remove();
          const btnCancel = document.createElement("button");
          btnCancel.type = "button";
          btnCancel.innerText = "✖";
          btnCancel.classList.add("cancel-audio");
          const btnAdd = document.createElement("button");
          btnAdd.type = "button";
          btnAdd.innerText = "✔";
          btnAdd.classList.add("add-audio");
          const time = document.createElement("div");
          time.classList.add("time");
          const secondsInTime = document.createElement("span");
          secondsInTime.innerText = "00";
          const minutesInTime = document.createElement("span");
          minutesInTime.innerText = "00";
          time.append(minutesInTime, secondsInTime);
          const btnBlockAudio = document.createElement("div");
          btnBlockAudio.classList.add("btn-block-in-audio");
          btnBlockAudio.append(btnAdd, time, btnCancel);
          const timeLine = document.querySelector(".time-line");
          timeLine.append(btnBlockAudio);
          minutesInTime.insertAdjacentText("beforeend", ":");
          setInterval(() => {
            secondsInTime.innerText = Number(secondsInTime.innerText) + 1;
            if (secondsInTime.innerText.length === 1) {
              secondsInTime.innerText = "0" + secondsInTime.innerText;
            }
            if (Number(secondsInTime.innerText) === 60) {
              minutesInTime.innerText = Number(minutesInTime.innerText) + 1;
              secondsInTime.innerText = "00";
            }
            if (minutesInTime.innerText.length === 1) {
              minutesInTime.innerText = "0" + minutesInTime.innerText;
            }
          }, 1000);
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          });
          const audio = document.createElement("audio");
          const recorder = new MediaRecorder(stream);
          const chunks = [];
          recorder.addEventListener("dataavailable", e => {
            chunks.push(e.data);
          });
          recorder.addEventListener("stop", () => {
            const blob = new Blob(chunks);
            audio.src = URL.createObjectURL(blob);
          });
          recorder.start();
          btnCancel.addEventListener("click", e => {
            e.target.closest(".btn-block-in-audio").remove();
            stream.getTracks().forEach(track => track.stop());
            recorder.stop();
            timeLine.insertAdjacentHTML("beforeend", `
              <button class="micro-btn">🎤</button>
              <button class="video-btn">🎞️</button>
              `);
          });
          btnAdd.addEventListener("click", e => {
            audio.setAttribute("controls", true);
            stream.getTracks().forEach(track => track.stop());
            recorder.stop();
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(data => {
                const {
                  latitude,
                  longitude
                } = data.coords;
                const formattedCoords = `[${latitude}, ${longitude}]`;
                const options = {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric"
                };
                const formattedDate = new Date().toLocaleDateString("ru-RU", options);
                const messageContainer = document.querySelector(".messages-container");
                const message = document.createElement("div");
                message.classList.add("message");
                const textBlock = document.createElement("div");
                textBlock.classList.add("text-block");
                const coordsEl = document.createElement("div");
                coordsEl.classList.add("coords");
                coordsEl.innerText = formattedCoords;
                const dateEl = document.createElement("div");
                dateEl.classList.add("date");
                dateEl.innerText = formattedDate;
                textBlock.append(audio, coordsEl);
                message.append(textBlock, dateEl);
                messageContainer.append(message);
              }, () => {
                this.partentEl.insertAdjacentHTML("afterbegin", `
              <div class="modal">
                <h3>Что то пошло не так</h3>
                <p>
                  К сожалению, нам не удалось определить ваше местоположение, пожалуйста,
                  дайте разрешение на использование геолокации, либо введите координаты
                  вручную
                </p>
                <p>Широта и долгота через запятую</p>
                <input type="text" class="coords-input" />
                <div class="btn-block">
                  <button class="cancel">Отмена</button>
                  <button class="ok">ОК</button>
                </div>
              </div>
              `);
                const cancel = document.querySelector(".cancel");
                cancel.addEventListener("click", e => {
                  e.target.closest(".modal").remove();
                });
                const okButton = document.querySelector(".ok");
                okButton.addEventListener("click", e => {
                  const modal = e.target.closest(".modal");
                  const coordsInput = modal.querySelector(".coords-input");
                  const coordsInputValue = coordsInput.value;
                  const testCaseOne = /^-?\d{1,2}.\d{5}, ?-?\d{1,2}.\d{5}$/gm.test(coordsInputValue);
                  const testCaseTwo = /^\[-?\d{1,2}.\d{5}, ?-?\d{1,2}.\d{5}\]$/gm.test(coordsInputValue);
                  if (testCaseOne || testCaseTwo) {
                    modal.remove();
                    const options = {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    };
                    const formattedDate = new Date().toLocaleDateString("ru-RU", options);
                    const messageContainer = document.querySelector(".messages-container");
                    const message = document.createElement("div");
                    message.classList.add("message");
                    const textBlock = document.createElement("div");
                    textBlock.classList.add("text-block");
                    const coordsEl = document.createElement("div");
                    coordsEl.classList.add("coords");
                    coordsEl.innerText = coordsInputValue;
                    const dateEl = document.createElement("div");
                    dateEl.classList.add("date");
                    dateEl.innerText = formattedDate;
                    textBlock.append(audio, coordsEl);
                    message.append(textBlock, dateEl);
                    messageContainer.append(message);
                  } else {
                    coordsInput.value = "Введите верные координаты";
                    coordsInput.setAttribute("disabled", true);
                    setTimeout(() => {
                      coordsInput.value = "";
                      coordsInput.removeAttribute("disabled");
                    }, 1000);
                  }
                });
              });
            }
            e.target.closest(".btn-block-in-audio").remove();
            timeLine.insertAdjacentHTML("beforeend", `
              <button class="micro-btn">🎤</button>
              <button class="video-btn">🎞️</button>
              `);
          });
        } catch (e) {
          console.error(e);
          const input = document.querySelector(".input-messages");
          input.value = "Нет доступа к микрофону";
          setTimeout(() => input.value = "", 1000);
          const timeLine = document.querySelector(".time-line");
          const btns = document.querySelector(".btn-block-in-audio");
          btns.remove();
          timeLine.insertAdjacentHTML("beforeend", `
              <button class="micro-btn">🎤</button>
              <button class="video-btn">🎞️</button>
              `);
        }
      }
    }
    if (e.target.classList.contains("video-btn")) {
      if (navigator.mediaDevices) {
        try {
          e.target.previousElementSibling.remove();
          e.target.remove();
          const btnCancel = document.createElement("button");
          btnCancel.type = "button";
          btnCancel.innerText = "✖";
          btnCancel.classList.add("cancel-audio");
          const btnAdd = document.createElement("button");
          btnAdd.type = "button";
          btnAdd.innerText = "✔";
          btnAdd.classList.add("add-audio");
          const time = document.createElement("div");
          time.classList.add("time");
          const secondsInTime = document.createElement("span");
          secondsInTime.innerText = "00";
          const minutesInTime = document.createElement("span");
          minutesInTime.innerText = "00";
          time.append(minutesInTime, secondsInTime);
          const btnBlockAudio = document.createElement("div");
          btnBlockAudio.classList.add("btn-block-in-audio");
          btnBlockAudio.append(btnAdd, time, btnCancel);
          const timeLine = document.querySelector(".time-line");
          timeLine.append(btnBlockAudio);
          minutesInTime.insertAdjacentText("beforeend", ":");
          setInterval(() => {
            secondsInTime.innerText = Number(secondsInTime.innerText) + 1;
            if (secondsInTime.innerText.length === 1) {
              secondsInTime.innerText = "0" + secondsInTime.innerText;
            }
            if (Number(secondsInTime.innerText) === 60) {
              minutesInTime.innerText = Number(minutesInTime.innerText) + 1;
              secondsInTime.innerText = "00";
            }
            if (minutesInTime.innerText.length === 1) {
              minutesInTime.innerText = "0" + minutesInTime.innerText;
            }
          }, 1000);
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
          });
          const video = document.createElement("video");
          const recorder = new MediaRecorder(stream);
          const chunks = [];
          recorder.addEventListener("dataavailable", e => {
            chunks.push(e.data);
          });
          recorder.addEventListener("stop", () => {
            const blob = new Blob(chunks);
            video.src = URL.createObjectURL(blob);
          });
          recorder.start();
          btnCancel.addEventListener("click", e => {
            e.target.closest(".btn-block-in-audio").remove();
            stream.getTracks().forEach(track => track.stop());
            recorder.stop();
            timeLine.insertAdjacentHTML("beforeend", `
              <button class="micro-btn">🎤</button>
              <button class="video-btn">🎞️</button>
              `);
          });
          btnAdd.addEventListener("click", e => {
            video.setAttribute("controls", true);
            stream.getTracks().forEach(track => track.stop());
            recorder.stop();
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(data => {
                const {
                  latitude,
                  longitude
                } = data.coords;
                const formattedCoords = `[${latitude}, ${longitude}]`;
                const options = {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric"
                };
                const formattedDate = new Date().toLocaleDateString("ru-RU", options);
                const messageContainer = document.querySelector(".messages-container");
                const message = document.createElement("div");
                message.classList.add("message");
                const textBlock = document.createElement("div");
                textBlock.classList.add("text-block");
                const coordsEl = document.createElement("div");
                coordsEl.classList.add("coords");
                coordsEl.innerText = formattedCoords;
                const dateEl = document.createElement("div");
                dateEl.classList.add("date");
                dateEl.innerText = formattedDate;
                textBlock.append(video, coordsEl);
                message.append(textBlock, dateEl);
                messageContainer.append(message);
              }, () => {
                this.partentEl.insertAdjacentHTML("afterbegin", `
              <div class="modal">
                <h3>Что то пошло не так</h3>
                <p>
                  К сожалению, нам не удалось определить ваше местоположение, пожалуйста,
                  дайте разрешение на использование геолокации, либо введите координаты
                  вручную
                </p>
                <p>Широта и долгота через запятую</p>
                <input type="text" class="coords-input" />
                <div class="btn-block">
                  <button class="cancel">Отмена</button>
                  <button class="ok">ОК</button>
                </div>
              </div>
              `);
                const cancel = document.querySelector(".cancel");
                cancel.addEventListener("click", e => {
                  e.target.closest(".modal").remove();
                });
                const okButton = document.querySelector(".ok");
                okButton.addEventListener("click", e => {
                  const modal = e.target.closest(".modal");
                  const coordsInput = modal.querySelector(".coords-input");
                  const coordsInputValue = coordsInput.value;
                  const testCaseOne = /^-?\d{1,2}.\d{5}, ?-?\d{1,2}.\d{5}$/gm.test(coordsInputValue);
                  const testCaseTwo = /^\[-?\d{1,2}.\d{5}, ?-?\d{1,2}.\d{5}\]$/gm.test(coordsInputValue);
                  if (testCaseOne || testCaseTwo) {
                    modal.remove();
                    const options = {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric"
                    };
                    const formattedDate = new Date().toLocaleDateString("ru-RU", options);
                    const messageContainer = document.querySelector(".messages-container");
                    const message = document.createElement("div");
                    message.classList.add("message");
                    const textBlock = document.createElement("div");
                    textBlock.classList.add("text-block");
                    const coordsEl = document.createElement("div");
                    coordsEl.classList.add("coords");
                    coordsEl.innerText = coordsInputValue;
                    const dateEl = document.createElement("div");
                    dateEl.classList.add("date");
                    dateEl.innerText = formattedDate;
                    textBlock.append(video, coordsEl);
                    message.append(textBlock, dateEl);
                    messageContainer.append(message);
                  } else {
                    coordsInput.value = "Введите верные координаты";
                    coordsInput.setAttribute("disabled", true);
                    setTimeout(() => {
                      coordsInput.value = "";
                      coordsInput.removeAttribute("disabled");
                    }, 1000);
                  }
                });
              });
            }
            e.target.closest(".btn-block-in-audio").remove();
            timeLine.insertAdjacentHTML("beforeend", `
              <button class="micro-btn">🎤</button>
              <button class="video-btn">🎞️</button>
              `);
          });
        } catch (e) {
          console.error(e);
          const input = document.querySelector(".input-messages");
          input.value = "Нет доступа к камере либо к микрофону";
          setTimeout(() => input.value = "", 1000);
          const timeLine = document.querySelector(".time-line");
          const btns = document.querySelector(".btn-block-in-audio");
          if (btns) {
            btns.remove();
          }
          timeLine.insertAdjacentHTML("beforeend", `
              <button class="micro-btn">🎤</button>
              <button class="video-btn">🎞️</button>
              `);
        }
      }
    }
  }
}
;// ./src/js/app.js

const timeLine = new TimeLine(document.body);
timeLine.bindToDOM();
;// ./src/index.js


/******/ })()
;