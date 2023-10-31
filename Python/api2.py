from flask import Flask, request, jsonify
from flask_cors import CORS
#from gpiozero import LED, PWMLED
import time

app = Flask(__name__)
cors = CORS(app)

# Thiết lập GPIO cho đèn và quạt
#light = PWMLED(17)  # GPIO pin cho đèn
#fan = PWMLED(27)  # GPIO pin cho quạt (PWM)
#fan.value = 0.5

# Thiết lập trạng thái ban đầu của các thiết bị
devices = {
    "light": {
        "status": "Off",
        "brightness": 0,
        "switchCount": 0,
        "usageTime": 0,
    },
    "fan": {
        "status": "Low",
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

                if status == "On":
                    # Bật đèn
                    # if brightness:
                    #     light.value(brightness)
                    # else:
                    #     light.on()

                    # Cập nhật trạng thái sử dụng của đèn
                    devices[device]["status"] = "On"
                    
                    if "last_usage_time" not in devices[device]:
                        current_time = time.time()
                        devices[device]["last_usage_time"] = current_time
                    else:
                        current_time = time.time()
                        devices[device]["last_usage_time"] = current_time

                    devices[device]["switchCount"] += 1
                else:
                    # Tắt đèn
                    #light.off()
                    
                    # Cập nhật trạng thái sử dụng của đèn
                    devices[device]["status"] = "Off"
                    if "last_usage_time" in devices[device]:
                        current_time = time.time()
                        elapsed_time = current_time - devices[device]["last_usage_time"]
                        devices[device]["usageTime"] += elapsed_time

                    devices[device]["switchCount"] += 1                          
            #################### Nếu là quạt ########################
            elif device == "fan":
                # Trích xuất giá trị tốc độ quạt từ yêu cầu (fan_speed từ 0 đến 1)
                fan_speed = data.get("fanSpeed")

                if fan_speed is not None:
                    devices[device]["speed"] = fan_speed * 100

                if status == "High":
                    # Điều chỉnh tốc độ quạt
                    #fan.value = fan_speed
                    
                    # Cập nhật trạng thái sử dụng của quạt
                    devices[device]["status"] = "High"

                    if "last_usage_time" not in devices[device]:
                        current_time = time.time()
                        devices[device]["last_usage_time"] = current_time
                    else:
                        current_time = time.time()
                        devices[device]["last_usage_time"] = current_time

                else:
                    # Tắt quạt
                    #fan.off()
                    
                    # Cập nhật trạng thái sử dụng của quạt
                    devices[device]["status"] = "Low"
                   
                    if "last_usage_time" in devices[device]:
                        current_time = time.time()
                        elapsed_time = current_time - devices[device]["last_usage_time"]
                        devices[device]["usageTime"] += elapsed_time

    return 'Success', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

