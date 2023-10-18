import android.os.AsyncTask;
import android.os.Bundle;
import android.widget.SeekBar;
import android.widget.SeekBar.OnSeekBarChangeListener;
import android.widget.Button;
import android.view.View;
import android.widget.TextView;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MainActivity extends android.app.Activity {

    private SeekBar fanSpeedSeekBar;
    private Button lightButton;
    private TextView fanSpeedTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        fanSpeedSeekBar = findViewById(R.id.fanSpeedSeekBar);
        lightButton = findViewById(R.id.lightButton);
        fanSpeedTextView = findViewById(R.id.fanSpeedTextView);

        fanSpeedSeekBar.setOnSeekBarChangeListener(new OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                // Hiển thị giá trị tốc độ quạt trên TextView
                fanSpeedTextView.setText("Tốc độ quạt: " + progress);

                // Gửi yêu cầu điều chỉnh tốc độ quạt khi giá trị thay đổi
                new ControlDeviceTask().execute("fan", String.valueOf(progress));
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                // Xử lý khi bắt đầu di chuyển thanh trượt (nếu cần)
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                // Xử lý khi kết thúc di chuyển thanh trượt (nếu cần)
            }
        });

        lightButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Gửi yêu cầu bật/tắt đèn
                new ControlDeviceTask().execute("light", "On");
            }
        });
    }

    private class ControlDeviceTask extends AsyncTask<String, Void, Void> {
        @Override
        protected Void doInBackground(String... params) {
            String device = params[0];
            String status = params[1];

            try {
                URL url = new URL("http://raspberrypi_ip:raspberrypi_port/api/devices");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                connection.setDoOutput(true);

                String jsonInputString = "{\"" + device + "\": \"" + status + "\"}";

                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = jsonInputString.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                connection.getResponseCode(); // Thực hiện yêu cầu

            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }
    }
}
