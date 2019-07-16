import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import styles from './styles';

const Prompt = props => {
  const [ value, setValue ] = useState(props.defaultValue);

  useEffect(() => {
    setValue(props.defaultValue);
  }, [props.defaultValue]);

  const _onChangeText = (text) => {
    setValue(text);
    props.onChangeText(text);
  };

  const _renderDialog = () => {
    const {
      title,
      placeholder,
      defaultValue,
      cancelText,
      submitText,
      borderColor,
      promptStyle,
      titleStyle,
      buttonStyle,
      buttonTextStyle,
      submitButtonStyle,
      submitButtonTextStyle,
      cancelButtonStyle,
      cancelButtonTextStyle,
      inputStyle
    } = props;
    return (
      <View style={styles.dialog} key="prompt">
        <View style={styles.dialogOverlay}/>
        <View style={[styles.dialogContent, { borderColor }, promptStyle]}>
          <View style={[styles.dialogTitle, { borderColor }]}>
            <Text style={[styles.dialogTitleText, titleStyle]}>
              { title }
            </Text>
          </View>
          <View style={styles.dialogBody}>
            <TextInput
              style={[styles.dialogInput, inputStyle]}
              defaultValue={defaultValue}
              onChangeText={_onChangeText}
              placeholder={placeholder}
              autoFocus={true}
              underlineColorAndroid="white"
              autoCapitalize="none"
              {...props.textInputProps} />
          </View>
          <View style={[styles.dialogFooter, { borderColor }]}>
            <TouchableWithoutFeedback onPress={props.onClose}>
              <View style={[styles.dialogAction, buttonStyle, cancelButtonStyle]}>
                <Text style={[styles.dialogActionText, buttonTextStyle, cancelButtonTextStyle]}>
                  {cancelText}
                </Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => props.onSubmit(value)}>
              <View style={[styles.dialogAction, buttonStyle, submitButtonStyle]}>
                <Text style={[styles.dialogActionText, buttonTextStyle, submitButtonTextStyle]}>
                  {submitText}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal onRequestClose={props.onClose} transparent={true} visible={props.visible}>
      {_renderDialog()}
    </Modal>
  );
};


Prompt.defaultProps = {
  visible: false,
  defaultValue: '',
  cancelText: 'Cancel',
  submitText: 'OK',
  borderColor:'#ccc',
  promptStyle: {},
  titleStyle: {},
  buttonStyle: {},
  buttonTextStyle: {},
  submitButtonStyle: {},
  submitButtonTextStyle: {},
  cancelButtonStyle: {},
  cancelButtonTextStyle: {},
  inputStyle: {},
  onChangeText: () => {},
};

export default Prompt;