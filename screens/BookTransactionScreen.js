import React from 'react';
import {Text
  ,View
  ,StyleSheet
  ,TouchableOpacity
  ,Image 
  ,  TextInput
  , KeyboardAvoidingView
,ToastAndroid
, Alert} from 'react-native';
import * as  Permissions from "expo-permissions";
import {BarCodeScanner} from 'expo-barcode-scanner';
import  firebase from 'firebase';
import db from '../config.js';

export default class TranasactionScreen extends React.Component  {
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedData:'',
            buttonState:'normal',
        }
    }
    getCameraPermission= async()=>{
        const {status} = await Permissions.askAsync(Permissions.Camera);
        this.setState({
            hasCameraPermissions:status ==='granted',
            buttonState:"clicked",
            scanned:false
        });
    }
    handleBarCodeScanned= async({type,data})=>{
        this.setState({
            scanned:true,
            scannedData:data,
            buttonState:"normal"
        });
    }

    handleTransaction=async()=>{
        var transactionMessage
        db.collection("books").doc(this.state.scannedBookId.get()
        .then((doc)=>{
           // console.log(doc.data())
           var book = doc.data()
           if (book.bookAvailability) {
               this.initiateBookIssue();
               transactionMessage = "Book Issued"
               //Alert.alert(transactionMessage);
               ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);
           }
           else {

            this.initiateBookReturn;
            transactionMessage = "Book Returned"
            //Alert.alert(transactionMessage);
            ToastAndroid.show(transactionMessage,ToastAndroid.SHORT);
           }
        })
        
        )
    }
    initiateBookIssue=async()=>{
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate,
            'transactionType':"Issue"
        })  
        db.collection("books").doc(this.state.scannedBookId).update({
           'bookAvailability':false
        }) 
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
         }) 
    }
    initiateBookReturn=async()=>{
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate,
            'transactionType':"return"
        })  
        db.collection("books").doc(this.state.scannedBookId).update({
           'bookAvailability':true
        }) 
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
         }) 
    }
    
    render() {
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
  
        if (buttonState !== "normal" && hasCameraPermissions){
          return(
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
          );
        }
  
        else if (buttonState === "normal"){
          return(
<KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
              <View>
                <Image
                  source={require("../assets/booklogo.jpg")}
                  style={{width:200, height: 200}}/>
                <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
              </View>
              <View style={styles.inputView}>

              <TextInput 
                style={styles.inputBox}
                placeholder="Book Id"
                onChangeText={text=>this.setState({scannedBookId:text})}
                value={this.state.scannedBookId}/>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>{
                  this.getCameraPermissions("BookId")
                }}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
              </View>
              <View style={styles.inputView}>
              <TextInput 
                style={styles.inputBox}
                placeholder="Student Id"
                onChangeText={text=>this.setState({scannedStudentId:text})}
                value={this.state.scannedStudentId}/>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={()=>{
                  this.getCameraPermissions("StudentId")
                }}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={async()=>{
                  var transactionMessage=this.handleTransaction
                  this.setState({
                    scannedBookId:'',
                    scannedStudentId:''
                  })
                }}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              </View>
              </KeyboardAvoidingView>
          );
        }
      }
    }


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    displayText:{
        fontSize:15,
        textDecorationLine:"underline"
    },
    scanButton:{
        backgroundColor:"#2196F3",
        padding:10,
        margin:10
    },
    buttonText:{
        fontSize: 20,
      }
  });
