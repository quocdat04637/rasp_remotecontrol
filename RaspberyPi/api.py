from flask import Flask, request, jsonify
from flask_cors import CORS
import RPi.GPIO as GPIO
import time

app = Flask(__name__)      
cors = CORS(app)

LIGHT_PIN = 17  # GPIO pin for the light control  
FAN_PIN = 27  # GPIO pin for the fan control
 


# Sử dụng chế độ BCM cho các chân GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(LIGHT_PIN, GPIO.OUT)
GPIO.setup(FAN_PIN, GPIO.OUT)


# Thiết lập GPIO cho đèn với tần số 100Hz
light=GPIO.PWM(LIGHT_PIN, 100) 



# Thiết lập GPIO  cho quạt với tần số 100Hz
fan = GPIO.PWM(FAN_PIN, 100)

# Bắt đầu với tốc độ quạt ban đầu là 0%
fan.start(0) 



# Thiết lập trạng thái ban đầu của các thiết bị
devices = {
    "light": {
        "status": "Off",
        "brightness": 0,
        "switchCount": 0,
        "usageTime": 0,
    },
    "fan": {
        "status": "Off",
        "speed": 0,
        "usageTime": 0,
    }
}

# API endpoint để lấy trạng thái của các thiết bị
@app.route('/api/device-status', methods=['GET'])
def get_device_status():
    return jsonify(devices)

# API endpoint để cập nhật trạng thái của các thiết bị
@app.route('/api/device-status', methods=['POST'])
def update_device_status():
    data = request.get_json()
    for device, status in data.items():
        if device in devices:
            ################## Nếu là đèn ###################
            if device == "light":
                # Trích xuất giá trị độ sáng đèn từ yêu cầu (brightness từ 0 đến 1)
                brightness = data.get("brightness")
                if brightness is not None:
                    devices[device]["brightness"] = brightness * 100

                # Trích xuất isDiffer
                isDiffer = data.get("isDiffer")

                # Trích xuất isSwitch
                isSwitch = data.get("isSwitch")

                if status == "On":
                    # Bật đèn
                    if brightness is not None:
                        light.ChangeDutyCycle(brightness*100)
                    else:
                        light.start(100)

                    # Cập nhật trạng thái sử dụng của đèn
                    devices[device]["status"] = "On"
                    
                    if "last_usage_time" not in devices[device]:
                        current_time = time.time()
                        devices[device]["last_usage_time"] = current_time
                    else:
                        current_time = time.time()
                        devices[device]["last_usage_time"] = current_time

                    if brightness is not None:
                        if isDiffer == True:
                            devices[device]["switchCount"] += 1  
                    else:
                            devices[device]["switchCount"] += 1  
                    
                    if isSwitch is not None:
                            devices[device]["switchCount"] += 1  
                else:
                    # Tắt đèn
                    light.ChangeDutyCycle(0)
                    
                    # Cập nhật trạng thái sử dụng của đèn
                    devices[device]["status"] = "Off"
                    if "last_usage_time" in devices[device]:
                        current_time = time.time()
                        elapsed_time = current_time - devices[device]["last_usage_time"]
                        devices[device]["usageTime"] += elapsed_time

                    if brightness is not None:
                        if isDiffer == True:
                            devices[device]["switchCount"] += 1  
                    else:
                            devices[device]["switchCount"] += 1  
                            
                    if isSwitch is not None:
                            devices[device]["switchCount"] += 1  
            #################### Nếu là quạt ########################
            elif device == "fan":
                # Trích xuất giá trị tốc độ quạt từ yêu cầu (fan_speed từ 0 đến 1)
                fan_speed = data.get("fanSpeed")

                if fan_speed is not None:
                    devices[device]["speed"] = fan_speed * 100

                if status == "On":
                    # Điều chỉnh tốc độ quạt
                    fan.ChangeDutyCycle(fan_speed * 100)
                    
                    # Cập nhật trạng thái sử dụng của quạt
                    devices[device]["status"] = "On"

                    if "last_usage_time" not in devices[device]:
                        current_time = time.time()
                        devices[device]["last_usage_time"] = current_time
                    else:
                        current_time = time.time()
                        devices[device]["last_usage_time"] = current_time

                else:
                    # Tắt quạt
                    fan.ChangeDutyCycle(0)
                    
                    # Cập nhật trạng thái sử dụng của đèn
                    devices[device]["status"] = "Off"
                    if "last_usage_time" in devices[device]:
                        current_time = time.time()
                        elapsed_time = current_time - devices[device]["last_usage_time"]
                        devices[device]["usageTime"] += elapsed_time
    return 'Success', 200

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=8080)
    finally:
        light.stop()
        fan.stop()
        GPIO.cleanup()
