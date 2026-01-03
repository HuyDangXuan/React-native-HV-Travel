import {View, StyleSheet} from "react-native"
import SignUpHeader from "./SignUpHeader"
import SignUpForm from "./SignUpForm"
import SignUpFooter from "./SignUpFooter"

export default function SignUpScreen(){
    return(
        <View style={styles.container}>
            <SignUpHeader/>
            <SignUpForm/>
            <SignUpFooter/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: "center",
    },
});