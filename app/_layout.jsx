import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, Image, TouchableOpacity, Modal, StyleSheet, Linking, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import axios from 'axios';
import YoutubePlayer from 'react-native-youtube-iframe';

const HomePage = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upiLink, setUpiLink] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [playing, setPlaying] = useState(true); // State to control autoplay

  const checkPaymentSuccess = useCallback(async () => {
    if (paymentStatus !== 'pending') return;

    try {
      const response = await axios.get(`https://kiosk-q5q4.onrender.com/payment-gateway/paymentStatus/${transactionId}`);
      if (response.data.data === true) {
        setPaymentStatus('success');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('failure');
    }
  }, [transactionId, paymentStatus]);

  useEffect(() => {
    let timeoutId;
    let intervalId;

    if (showPaymentModal && transactionId && paymentStatus === 'pending') {
      intervalId = setInterval(checkPaymentSuccess, 3000);

      timeoutId = setTimeout(() => {
        if (paymentStatus === 'pending') {
          setPaymentStatus('failure');
        }
      }, 120000);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [transactionId, showPaymentModal, paymentStatus, checkPaymentSuccess]);

  const generateOrderId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const handleInstantReportClick = async () => {
    setShowPaymentModal(true);
    const orderId = generateOrderId();
    try {
      const token = '367|qM5tv66Rhk8Tm13DlvDkc92KNwVMvAhOuljLB8tA';
      const transactionData = {
        amount: '1',
        description: 'Health ATM Report',
        name: 'Gopi',
        email: 'dhanushnm07@gmail.com',
        mobile: Number('1234567890'),
        enabledModesOfPayment: 'upi',
        payment_method: 'UPI_INTENT',
        source: 'api',
        order_id: orderId,
        user_uuid: 'swp_sm_903dd099-3a9e-4243-ac1e-f83f83c30725',
        other_info: 'api',
        encrypt_response: 0
      };

      const formData2 = new FormData();
      for (const key in transactionData) {
        formData2.append(key, transactionData[key]);
      }

      const transactionResponse = await axios.post('https://www.switchpay.in/api/createTransaction', formData2, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const { upi_intent_link, transaction_id } = transactionResponse.data;
      setUpiLink(upi_intent_link);
      setTransactionId(transaction_id);
    } catch (error) {
      console.error('Error submitting form:', error.response ? error.response.data : error.message);
      setPaymentStatus('failure');
    }
  };

  const redirectToAndroidApp = () => {
    Linking.openURL('intent://#Intent;package=com.burra.cowinemployees;end')
      .then(success => {
        if (success) {
          console.log('App opened successfully');
        } else {
          console.error('Failed to open app');
        }
      })
      .catch(error => {
        console.error('Error opening app:', error);
      });
  };
  

  const closeModal = () => {
    setShowPaymentModal(false);
    setPaymentStatus('pending');
  };

  useEffect(() => {
    if (paymentStatus === 'success') {
      setTimeout(() => {
        redirectToAndroidApp();
      }, 2000);
    } else if (paymentStatus === 'failure') {
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStatus('pending');
      }, 2000);
    }
  }, [paymentStatus]);

  const onStateChange = (state) => {
    if (state === 'ended') {
      setPlaying(true); // Restart video when it ends
    }
  };

  const togglePlaying = () => {
    setPlaying(!playing);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Logo and Title */}
      <View style={styles.headerContainer}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.title}>{ `Health ATM \n(Vitals Checking Machine) `}</Text>
      </View>

      <Text style={styles.subtitle}>Check Your Vitals, Instant Report</Text>

      <TouchableOpacity style={styles.instantReportButton} onPress={handleInstantReportClick}>
        <Text style={styles.buttonText}>Check Your Vitals</Text>
        <Image source={require('../assets/images/click.gif')} style={styles.clickImage} />
      </TouchableOpacity>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {paymentStatus === 'pending' && (
              <>
                <Text style={styles.paymentText}>Pay 99/- INR to Proceed</Text>
                {upiLink ? (
                  <QRCode value={upiLink} size={300} />
                ) : (
                  <Text>Loading payment link...</Text>
                )}
                <Button title="Close" onPress={closeModal} />
              </>
            )}
            {paymentStatus === 'success' && (
              <Text style={styles.successText}>Payment Successful!</Text>
            )}
            {paymentStatus === 'failure' && (
              <Text style={styles.failureText}>Payment Failed, Please Try Again</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Parameters List */}
      <View style={styles.parametersSection}>
        <Text>Age / ವಯಸ್ಸು</Text>
        <Text>Height / ಎತ್ತರ</Text>
        <Text>Weight / ತೂಕ</Text>
        <Text>Body Mass Index / ದೇಹದ ಮಾಪಕ</Text>
        <Text>Nutritional Status / ಪೋಷಕ ಸ್ಥಿತಿ</Text>
        <Text>Ideal Body Weight / ಆದರ್ಶ ದೇಹದ ತೂಕ</Text>
        <Text>Body Fat / ದೇಹದ ಕೊಬ್ಬು</Text>
      </View>

      <View>
        <Text>Total Body Water / ಒಟ್ಟು ದೇಹದ ನೀರು</Text>
        <Text>Basal Metabolic Rate / ಮೂಲವ್ಯೂಪಚಯ ದರ</Text>
        <Text>Fat Mass / ಕೊಬ್ಬಿನ ಪ್ರಮಾಣ</Text>
        <Text>Lean/Skeletal Body Mass / ಕುಳಿತ ದೇಹದ ಪ್ರಮಾಣ</Text>
        <Text>Overweight By / ಅಧಿಕ ತೂಕದ ಮೂಲಕ</Text>
        <Text>Recommendations / ಶಿಫಾರಸುಗಳು</Text>
        <Text>Your Lucky Message / ನಿಮ್ಮ ಭಾಗ್ಯದ ಸಂದೇಶ</Text>
      </View>

      {/* YouTube Video */}
      <View style={styles.videoContainer}>
        <YoutubePlayer
          height={200}
          play={playing} // Controls autoplay
          videoId={'Erhv6vECfPU'}  // Replace with your video ID
          onChangeState={onStateChange}
          playerVars={{
            autoplay: 1, // Auto-play the video
            playlist: 'Erhv6vECfPU', // Required to enable looping
          }}
        />
        <Button title={playing ? "Pause Video" : "Play Video"} onPress={togglePlaying} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Your existing styles here...
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
  instantReportButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 26,
    marginRight: 10,
  },
  clickImage: {
    width: 50,
    height: 50,
    borderRadius: 55,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 18,
    marginBottom: 20,
  },
  successText: {
    color: 'green',
    fontSize: 22,
  },
  failureText: {
    color: 'red',
    fontSize: 18,
  },
  parametersSection: {
    marginVertical: 20,
  },
  videoContainer: {
    marginTop: 20,
  },
});

export default HomePage;
