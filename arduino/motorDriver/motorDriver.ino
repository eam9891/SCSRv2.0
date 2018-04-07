const int trigPin = 4;
const int echoPin = 5;
long duration;
int distance;
String piMsg;
String motorMsg;
boolean isMoving = false;

void setup() {
    pinMode(trigPin, OUTPUT);               // Sets the trigPin as an Output
    pinMode(echoPin, INPUT);                // Sets the echoPin as an Input
    Serial.begin(115200);                   // Setup serial communication with RPi
    Serial1.begin(115200);                  // Setup serial communication with motor controller
}

boolean collisionDetection() {
    boolean collisionDetected = false;      // Set a flag to false
    digitalWrite(trigPin, LOW);             // Clears the trigPin
    delayMicroseconds(2);                   // Delay 2us after clearing trigPin
    digitalWrite(trigPin, HIGH);            // Sets the trigPin on HIGH state for 10 micro seconds
    delayMicroseconds(10);                  // Delay 10us after writing trigPin
    digitalWrite(trigPin, LOW);             // Set the trigPin to LOW
    duration = pulseIn(echoPin, HIGH);      // Reads the echoPin, returns the sound wave travel time in microseconds
    distance = duration * 0.034 / 2;        // Calculate the distance in cm
    if (distance < 30) {                    // If the distance is less than 30 cm
        collisionDetected = true;           // Set the flag to true
    }
    return collisionDetected;               // Return the flag
}


void loop() {

    // If serial data is available on the RPi connection
    if (Serial.available() > 0) {
        piMsg = Serial.readStringUntil('\n');
        Serial1.print(piMsg + '\r');
        switch(piMsg[0]) {
            case 'w':
                isMoving = true;
                break;
            case 's':
                isMoving = true;
                break;
            case 'a':
                isMoving = true;
                break;
            case 'd':
                isMoving = true;
                break;
            default:
                break;
        }
    }

    // If serial data is available on the motor controller connection
    if (Serial1.available() > 0) {
        motorMsg = Serial1.readStringUntil('.');
        Serial.print(motorMsg);
    }

    if (isMoving) {
        if (collisionDetection()) {

            // Here we could add some loop to gradually decrease the value to 0

            Serial.print(255);        // If a collision is detected, print error code
            Serial1.print("@0st0\r");
            Serial1.print("@1st0\r");
            isMoving = false;
        }
    }
    
}
