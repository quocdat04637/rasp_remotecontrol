document.addEventListener("DOMContentLoaded", function() {
    const lightButton = document.getElementById("lightButton");
    const lightStatus = document.getElementById("lightStatus");
    const lightBrightnessRange = document.getElementById("lightBrightnessRange");
    const lightBrightnessValue = document.getElementById("lightBrightnessValue");

    // Lấy tham chiếu đến input số giây tắt đèn
    const turnOffDelayInput = document.getElementById("turnOffDelay");
    const turnOffStepSpan = document.getElementById("turnOffStep");
    // Lấy tham chiếu đến input số giây bật đèn
    const turnOnDelayInput = document.getElementById("turnOnDelay");
    const turnOnStepSpan = document.getElementById("turnOnStep");

    const fanSpeedRange = document.getElementById("fanSpeedRange");
    const fanSpeedValue = document.getElementById("fanSpeedValue");
    const fanStatus = document.getElementById("fanStatus");

    // Xử lý sự kiện khi nhấn nút On/Off
    lightButton.addEventListener("click", function() {
        // Lấy trạng thái hiện tại của đèn
        fetch("http://127.0.0.1:8080/api/device-status")
        .then(response => response.json())
        .then(data => {
            const currentLightStatus = data.light.status;
            // Đảo ngược trạng thái và gửi yêu cầu cập nhật
            const newLightStatus = currentLightStatus === "On" ? "Off" : "On";
            sendLightRequest(newLightStatus);
        })
        .catch(error => console.error(error));
    });

    function sendLightRequest(newStatus) {
        fetch("http://127.0.0.1:8080/api/device-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ light: newStatus })
        })
        .then(response => {
            if (response.status === 200) {
                // Cập nhật trạng thái đèn sau khi hoàn thành yêu cầu
                lightButton.textContent = newStatus;
                lightButton.style.background = newStatus === "On" ? "green" : "red";
                lightStatus.textContent = newStatus;
                if (newStatus == "On") {
                    lightBrightnessRange.value = 100;
                    lightBrightnessValue.textContent = "100%";
                    // Gửi cập nhật lên máy chủ
                    fetch("http://127.0.0.1:8080/api/device-status", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({light: "On", brightness: 1})
                    })
                } else {
                    lightBrightnessRange.value = 0;
                    lightBrightnessValue.textContent = "0%";
                    // Gửi cập nhật lên máy chủ
                    fetch("http://127.0.0.1:8080/api/device-status", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({light: "Off", brightness: 0})
                    })
                }
            }
        })
        .catch(error => console.error(error));
    }

    // Xử lý sự kiện khi kéo thanh độ sáng đèn
    lightBrightnessRange.addEventListener("input", function() {
        // Lấy trạng thái hiện tại của đèn
        fetch("http://127.0.0.1:8080/api/device-status")
        .then(response => response.json())
        .then(data => {
            const oldLightStatus = data.light.status;
            const brightness = lightBrightnessRange.value;
            lightBrightnessValue.textContent = brightness + "%";
            // Thay đổi trạng thái dựa vào brightness và gửi yêu cầu cập nhật
            const newLightStatus = brightness > 0 ? "On" : "Off";

            sendLightRequestUpdateBrightness(newLightStatus, brightness/100, oldLightStatus != newLightStatus);
        })
        .catch(error => console.error(error));
    })

    function sendLightRequestUpdateBrightness(newStatus, brightness, isDiffer) {
        console.log(isDiffer);
        // Tạo đối tượng JSON để gửi lên máy chủ
        const requestData = {
            light: newStatus,
            brightness: brightness,
            isDiffer: isDiffer
        };

        fetch("http://127.0.0.1:8080/api/device-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (response.status === 200) {
                // Cập nhật trạng thái đèn sau khi hoàn thành yêu cầu
                lightStatus.textContent = newStatus;
                lightButton.style.background = brightness > 0 ? "green": "red";
                lightButton.textContent = newStatus;

            }
        })
        .catch(error => console.error(error));
    }
   

    // Xử lý sự kiện khi thay đổi thời gian đếm ngược để tắt đèn
    turnOffDelayInput.addEventListener("change", function() {
        // Lấy trạng thái hiện tại của đèn
        fetch("http://127.0.0.1:8080/api/device-status")
        .then(response => response.json())
        .then(data => {
            const currentLightStatus = data.light.status;
            // Nếu đèn đang sáng thì sẽ tắt sau ? giây
            if (currentLightStatus === "On") {
                // Lưu biến tham chiếu đến interval để có thể xóa nó sau khi kết thúc 
                let interval;
                const delaySeconds = parseInt(turnOffDelayInput.value);
                // Bắt đầu hẹn giờ và cập nhật số giây mỗi 1 giây
                let remainingSeconds = delaySeconds;
                turnOffStepSpan.textContent = remainingSeconds;
                interval = setInterval(function() {
                    remainingSeconds--;
                    turnOffStepSpan.textContent = remainingSeconds;
                    if (remainingSeconds === 0) {
                        clearInterval(interval);
                    }
                }, 1000);


                setTimeout(() => {
                    fetch("http://127.0.0.1:8080/api/device-status", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ light: "Off" })
                    })
                    .then(response => {
                        if (response.status === 200) {
                            // Cập nhật trạng thái đèn sau khi hoàn thành yêu cầu
                            lightButton.textContent = "Off";
                            lightButton.style.background = "red";
                            lightStatus.textContent = "Off";
                        }
                    })
                    .catch(error => console.error(error));
                }, delaySeconds * 1000);
            }
            turnOffDelayInput.value = 0;
            //turnOffStepSpan.textContent = "?";
        })
        .catch(error => console.error(error));
    })


    // Xử lý sự kiện khi thay đổi thời gian đếm ngược để bật đèn
    turnOnDelayInput.addEventListener("change", function() {
        // Lấy trạng thái hiện tại của đèn
        fetch("http://127.0.0.1:8080/api/device-status")
        .then(response => response.json())
        .then(data => {
            const currentLightStatus = data.light.status;
            // Nếu đèn đang tắt thì sẽ bật sau ? giây
            if (currentLightStatus === "Off") {
                // Lưu biến tham chiếu đến interval để có thể xóa nó sau khi kết thúc 
                let interval;
                const delaySeconds = parseInt(turnOnDelayInput.value);
                // Bắt đầu hẹn giờ và cập nhật số giây mỗi 1 giây
                let remainingSeconds = delaySeconds;
                turnOnStepSpan.textContent = remainingSeconds;
                interval = setInterval(function() {
                    remainingSeconds--;
                    turnOnStepSpan.textContent = remainingSeconds;
                    if (remainingSeconds === 0) {
                        clearInterval(interval);
                    }
                }, 1000);


                setTimeout(() => {
                    fetch("http://127.0.0.1:8080/api/device-status", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ light: "On" })
                    })
                    .then(response => {
                        if (response.status === 200) {
                            // Cập nhật trạng thái đèn sau khi hoàn thành yêu cầu
                            lightButton.textContent = "On";
                            lightButton.style.background = "green";
                            lightStatus.textContent = "On";
                        }
                    })
                    .catch(error => console.error(error));
                }, delaySeconds * 1000);
            }
            turnOnDelayInput.value = 0;
            //turnOnStepSpan.textContent = "?";
        })
        .catch(error => console.error(error));
    })



    // xử lý sự kiện khi kéo thanh tốc độ quạt
    fanSpeedRange.addEventListener("input", function() {
        const speed = fanSpeedRange.value;
        fanSpeedValue.textContent = speed + "%";
        updateFanSpeed(speed/100);
    });


    function updateFanSpeed(speed) {
        // Thay đổi trạng thái dựa vào speed và gửi yêu cầu cập nhật
        const newFanStatus = speed > 0 ? "On" : "Off";
        sendFanRequest(newFanStatus, speed);
    }

    function sendFanRequest(newStatus, speed) {
        // Tạo đối tượng JSON để gửi lên máy chủ
        const requestData = {
            fan: newStatus,
            fanSpeed: speed,
        };

        fetch("http://127.0.0.1:8080/api/device-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (response.status === 200) {
                // Cập nhật trạng thái quạt sau khi hoàn thành yêu cầu
                fanStatus.textContent = newStatus;
            }
        })
        .catch(error => console.error(error));
    }
   
});
