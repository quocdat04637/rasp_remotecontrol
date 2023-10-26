from flask import Flask, request, jsonify
from flask_cors import CORS
from gpiozero import LED, PWMLED
import time

app = Flask(__name__)
cors = CORS(app)

# Thiết lập GPIO cho đèn và quạt
light = LED(17)  # GPIO pin cho đèn
fan = PWMLED(18)  # GPIO pin cho quạt (PWM)

# Thiết lập trạng thái ban đầu của các thiết bị
devices = {
    "light": {
        "status": "Off",
        "switchCount": 0,
        "usageTime": "0 giờ"
    },
    "fan": {
        "status": "Low",
        "speed": "0%",
        "usageTime": "0 giờ"
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
            if device == "light":
                if status == "On":
                    # Bật đèn 
                    light.on()
                    devices[device]["status"] = "On"
                
                    # Cập nhật trạng thái sử dụng của đèn
                    if devices[device]["status"] == "On":
                        current_time = time.time()
                        if "last_usage_time" not in devices[device]:
                            devices[device]["last_usage_time"] = current_time
                        else:
                            elapsed_time = current_time - devices[device]["last_usage_time"]
                            devices[device]["usageTime"] = f"{elapsed_time:.1f} giờ"

                        devices[device]["switchCount"] += 1
                else:
                    # Tắt đèn
                    light.off()
                    devices[device]["status"] = "Off"

                    # Cập nhật trạng thái sử dụng của đèn
                    if devices[device]["status"] == "Off":
                        if "last_usage_time" in devices[device]:
                            current_time = time.time()
                            elapsed_time = current_time - devices[device]["last_usage_time"]
                            devices[device]["usageTime"] = f"{elapsed_time:.1f} giờ"              
            elif device == "fan":
                # Trích xuất giá trị tốc độ quạt từ yêu cầu (fan_speed từ 0 đến 1)
                fan_speed = data.get("fanSpeed")
                if fan_speed is not None:
                    devices[device]["speed"] = f"{int(fan_speed * 100)}%"

                if status == "High":
                    # Điều chỉnh tốc độ quạt
                    fan.value = fan_speed
                    devices[device]["status"] = "High"
                    
                    # Cập nhật trạng thái sử dụng của quạt
                    if devices[device]["status"] == "High":
                        current_time = time.time()
                        if "last_usage_time" not in devices[device]:
                            devices[device]["last_usage_time"] = current_time
                        else:
                            elapsed_time = current_time - devices[device]["last_usage_time"]
                            devices[device]["usageTime"] = f"{elapsed_time:.1f} giờ"        
                else:
                    # Tắt quạt
                    fan.off()
                    devices[device]["status"] = "Low"
                    
                    # Cập nhật trạng thái sử dụng của quạt
                    if devices[device]["status"] == "Low":
                        if "last_usage_time" in devices[device]:
                            current_time = time.time()
                            elapsed_time = current_time - devices[device]["last_usage_time"]
                            devices[device]["usageTime"] = f"{elapsed_time:.1f} giờ"

                        devices[device]["speed"] = "0%"
    return 'Success', 200

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=8080)
    finally:
        GPIO.cleanup()
