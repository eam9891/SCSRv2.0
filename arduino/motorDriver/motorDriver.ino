const int trigPin = 4;
const int echoPin = 5;
long duration;
int distance;
String piMsg;
String motorMsg;
boolean isMoving = false;


/*
    Arduino setup function
    Sets up pins and serial ports
*/
void setup() {
    pinMode(trigPin, OUTPUT);               // Sets the trigPin as an Output
    pinMode(echoPin, INPUT);                // Sets the echoPin as an Input
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.begin(115200);                   // Setup serial communication with RPi
    Serial2.begin(115200);                  // Setup serial communication with motor controller
}



/*
  Collision Detection Function
  Return true if an object is within the sensors range
*/
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


/*
  Motor driver torque setting function
  Must set the channel, and torque value

  Channel 0 = Left Motor
  Channel 1 = Right Motor
  Torque values range from -255 to 255
*/
void setTorque(int channel, int value) {

    // The line below sets up and sends the command string
    // Ex: if the function is called like so - setTorque(0, 255)
    //     this line will become "@0st255\r"
    Serial3.print("@");
    Serial3.print(channel);
    Serial3.print("st");
    Serial3.print(value);
    Serial3.print("\r");

    isMoving = true;

    // If the power slew doesn't do what we want, we can put the for loop here to gradually
    // decrease the torque values

    

}

/*
    Arduino loop function
    After setup and initialization this function runs continuously
*/
void loop() {


    if (Serial.available() > 0) {                       // If serial data is available on the RPi connection
        piMsg = Serial.readStringUntil('\n');           // Read data from the RPi until newline character
        //Serial.print(piMsg);
        /*switch(piMsg[0]) {                              // Handle all possible commands
            case 'w':                                   // If w, move forward
                setTorque(0, -175);                      // Set left channel torque to 255, go forward
                setTorque(1, 175);                      // Set right channel torque to 255, go forward
                break;
            case 's':                                   // If s, move backward
                setTorque(0, 175);                     // Set left channel torque to -255, go backward
                setTorque(1, -175);                     // Set right channel torque to -255, go backward
                break;
            case 'a':                                   // If a, move left
                setTorque(0, -175);                     // Set left channel torque to -255, go backward
                setTorque(1, -175);                      // Set right channel torque to 255, go forward
                break;
            case 'd':                                   // If d, move right
                setTorque(0, 175);                      // Set left channel torque to 255, go forward
                setTorque(1, 175);                     // Set right channel torque to -255, go backward
                break;
            case 'x':                                   // If x, brake
                setTorque(0, 0);                        // Set left channel torque to 0
                setTorque(1, 0);                        // Set right channel torque to 0
                break;
            default:                                    // If any other characters come in, break out of switch
                break;
        }*/
        Serial2.print(piMsg);
        Serial2.print('\n');
    }


    if (Serial2.available() > 0) {                      // If serial data is available on the motor controller connection
        digitalWrite(LED_BUILTIN, HIGH);
        motorMsg = Serial2.readStringUntil('.');        // Read the data from Motor Controller until a period is received
        Serial.print(motorMsg);                         // Print out the data to the RPi
        digitalWrite(LED_BUILTIN, LOW);
        
    }


    if (isMoving) {                                     // If we are moving, we need to check for collision
        if (collisionDetection()) {                     // If collision returns true
            Serial.print(255);                          // Print error code
            setTorque(0, 0);                            // Set left channel torque to 0
            setTorque(1, 0);                            // Set right channel torque to 0
            isMoving = false;                           // Now we are stopped, set our boolean to false
        }
    }


}
