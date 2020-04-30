import React from 'react';
import {View, TouchableOpacity, Text, ScrollView} from 'react-native';
import C from 'consistencss';

const Shortcuts = ({color, actions, onPress}) => (
  <View style={[C.row, {overflowX: 'visible'}]}>
    <ScrollView horizontal keyboardShouldPersistTaps="always">
      {actions.map((a, index) => (
        <TouchableOpacity
          key={index}
          style={C.p4}
          onPress={(e) => e.stopPropagation() || onPress(a.key)}
        >
          <Text style={{color, fontSize: 18}}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default Shortcuts;
