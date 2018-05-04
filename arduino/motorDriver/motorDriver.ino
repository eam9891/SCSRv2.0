const int trigPin = 4;
const int echoPin = 5;
const int trigPin2 = 6;
const int echoPin2 = 7;
long duration;
int distance;
String piMsg;


/*
    Arduino setup function
    Sets up pins and serial ports
*/
void setup() {
    pinMode(trigPin, OUTPUT);               // Sets the trigPin as an Output
    pinMode(echoPin, INPUT);                // Sets the echoPin as an Input
    pinMode(trigPin2, OUTPUT);               // Sets the trigPin as an Output
    pinMode(echoPin2, INPUT);                // Sets the echoPin as an Input
    Serial.begin(115200);                   // Setup serial communication with RPi
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
    if (distance < 70) {                    // If the distance is less than 30 cm
        collisionDetected = true;           // Set the flag to true
    }
    return collisionDetected;               // Return the flag
}

boolean collisionDetection2() {
    boolean collisionDetected = false;      // Set a flag to false
    digitalWrite(trigPin2, LOW);             // Clears the trigPin
    delayMicroseconds(2);                   // Delay 2us after clearing trigPin
    digitalWrite(trigPin2, HIGH);            // Sets the trigPin on HIGH state for 10 micro seconds
    delayMicroseconds(10);                  // Delay 10us after writing trigPin
    digitalWrite(trigPin2, LOW);             // Set the trigPin to LOW
    duration = pulseIn(echoPin2, HIGH);      // Reads the echoPin, returns the sound wave travel time in microseconds
    distance = duration * 0.034 / 2;        // Calculate the distance in cm
    if (distance < 70) {                    // If the distance is less than 30 cm
        collisionDetected = true;           // Set the flag to true
    }
    return collisionDetected;               // Return the flag
}



void loop() {


    if (collisionDetection()) {
        Serial.println('z');
    }

    if (collisionDetection2()) {
        Serial.println('z');
    }


}
