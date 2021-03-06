import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    Animated,
    Easing,
    PanResponder,
    Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import Checkbox from './Checkbox';

export default class TaskItem extends Component {
    constructor(props) {
        super(props);
        
        this.nameColor = new Animated.Value(1);
        this.taskOpacity = new Animated.Value(1);
        this.taskPosition = new Animated.ValueXY();
    }

    componentWillMount() {
        this.initPanResponder();
    }

    componentDidMount() {
        this.handleOpacity(400);
    }

    componentDidUpdate() {
        this.handleOpacity();
    }

    initPanResponder() {
        let { onDragRelease } = this.props;

        this.panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderGrant: (e, gestureState) => {
                this.taskPosition.setValue({ x: 0 });

                Animated.timing(this.taskOpacity,{ 
                    toValue: 0.3,
                    duration: 250,
                }).start();
            },
            onPanResponderMove: (e, gestureState) => {
                if (gestureState.dx < 0) return;
                this.taskPosition.setValue({ x: gestureState.dx });
            },
            onPanResponderRelease: (e, gestureState) => {
                const width = Dimensions.get('screen').width;

                Animated.parallel([
                    Animated.spring(this.taskPosition.x, { 
                        toValue: 0, 
                        friction: 6,
                        tension: 0.5,
                    }),
                    Animated.timing(this.taskOpacity, { 
                        toValue: 1,
                        duration: 250,
                    }),
                ]).start();

                if (onDragRelease && gestureState.dx > width * 0.6) {
                    onDragRelease();
                }
            }
        });
    }

    handleOpacity(delay = 0) {
        let {
            size,
            isComplete,
        } = this.props;

        Animated.timing(this.nameColor, {
            delay,
            toValue: isComplete ? 0.2 : 1,
            duration: 250,
            easing: Easing.ease,
        }).start(() => this.isAnimationRun = false);
    }

    render() {
        let {
            name,
            onPress,
            isComplete,
        } = this.props;

        let translateX = this.taskPosition.x;
        let containerStyle = { 
            transform: [{ translateX }],
            opacity: this.taskOpacity,
        };

        let nameStyle = {
            opacity: this.nameColor,
        };

        return (
            <Animated.View 
                {...this.panResponder.panHandlers}
                style={[styles.container, containerStyle]}>
                <TouchableWithoutFeedback onPress={onPress}>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Animated.Text style={[styles.name, nameStyle]}>
                                {name}
                            </Animated.Text>
                        </View>
                        <View style={{ marginLeft: 32 }}>
                            <Checkbox
                                isChecked={isComplete}
                                onPress={onPress} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Animated.View>
        );
    }
}

TaskItem.propTypes = {
    name: PropTypes.string,
    isComplete: PropTypes.bool,
    onPress: PropTypes.func,
    onDragRelease: PropTypes.func,
};

TaskItem.defaultProps = {
    name: 'Task Name',
    isComplete: false,
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
    },
    name: {
        color: '#555',
        fontSize: 16
    },
    task: {
        color: '#ccc'
    }
});