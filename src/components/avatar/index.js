
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Image
} from 'react-native';


export default class Avatar extends Component<{}> {
    static defaultProps = {
        size: 50,
        circle: true
    };
    render() {
        return (
            <Image source={this.props.img} resizeMethod="resize"
                style={[styles.avatarContainer, {
                    height: this.props.size,
                    width: this.props.size,
                    borderRadius: this.props.circle ? this.props.size / 2 : 0
                }]} resizeMode={'cover'} />
        );
    }
}

const styles = StyleSheet.create({
    avatarContainer: {
        overflow: 'hidden',
    },

});
