import {View, StyleSheet} from "react-native"
import LoginHeader from "./LoginHeader"
import LoginForm from "./LoginForm"
import LoginFooter from "./LoginFooter"


export default function LoginScreen(){
    return(
        <View style={styles.container}>
            <LoginHeader/>
            <LoginForm/>
            <LoginFooter/>
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