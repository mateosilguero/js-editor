import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useStoreState } from 'easy-peasy';

const DrawerContent = ({ menuItems, onPress }) => {
	const {
    theme: { primary, maincolor },
    themeColors: {
      backgroundColor,
      color,
      highlightColor
    }
  } = useStoreState(store => store);
  return(
		<View
			style={{ 
				...styles.container,
				backgroundColor,
				borderRightRadius: 4,
		    borderRightWidth: 0.5,
		    borderRightColor: color
		  }}
		>
			<Text style={{ ...styles.title, color: maincolor, backgroundColor: primary }}>
				JS
			</Text>
			<View style={{ padding: 16 }}>
				{
					menuItems
						.map((m, index) =>
							<TouchableOpacity
								key={index}
					      style={styles.menuItem}
					      onPress={() => (m.onPress && m.onPress(), onPress(m.key, m.params))}
					     >
					     	<Icon name={m.icon} style={{ color, fontSize: 20, paddingRight: 16, paddingTop: 4 }} />
					      <Text style={{ color, fontSize: 20 }}>
					      	{m.label}
					      </Text>
					    </TouchableOpacity>
						)
				}
			</View>
	  </View>
	)
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    height: 56,
    fontWeight: 'bold',
    elevation: 3
  },
  menuItem: {
  	height: 48,
  	flexDirection: 'row'
  }
});

export default DrawerContent;