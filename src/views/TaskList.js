import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    AsyncStorage
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import Header from '../components/Header';
import ProjectItem from '../components/ProjectItem';
import ModalCreate from '../components/ModalCreate';
import ButtonPlus from '../components/ButtonPlus';

import {
    addTask
} from '../config/Actions';

class TaskList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false,
            newTask: '',
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.inputTask = this.inputTask.bind(this);
    }

    openModal() {
        this.setState({
            isModalOpen: true
        });
    }

    closeModal() {
        this.setState({
            isModalOpen: false
        });
    }

    inputTask(text) {
        this.setState({
            newTask: text
        });
    }

    render() {
        let {
            isModalOpen,
            newTask
        } = this.state;

        let {
            tasks,
            project,
            submit
        } = this.props;

        return (
            <View style={styles.container}>
                <Header title={project.name} />
                <View style={{ position: 'absolute', top: 24, right: 24 }}>
                    <ButtonPlus 
                        size={32}
                        onPress={this.openModal} />
                </View>

                {tasks.length > 0 ? (
                    <ScrollView style={{ flex: 1, marginTop: 32 }}>
                        {tasks.map((task) => {
                            return (
                                <ProjectItem
                                    key={task.id}
                                    name={task.name} />
                            );
                        })}
                    </ScrollView>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.empty}>
                            No tasks found, let's create one.
                        </Text>
                    </View>
                )}

                <ModalCreate
                    isOpen={isModalOpen}
                    onPressCancel={this.closeModal}
                    onPressOK={() => submit(newTask, () => {
                        this.closeModal();
                        this.setState({ newTask: '' });
                    })}
                    onChangeText={this.inputTask}
                    value={newTask}
                    title="New Task" />
            </View>
        );
    }
}

TaskList.navigationOptions = {
    header: null
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        position: 'relative'
    },
    buttonPlus: {
        position: 'absolute',
        top: 32,
        right: 32,
    },
    empty: {
        width: '75%',
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 32
    }
});

function mapStateToProps(state) {
    return {
        projects: state.projects,
        tasks: state.tasks,
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        submit: (id, name, projectID) => {
            dispatch(addTask(id, name, projectID));
        }
    }
}

function mergeProps(stateProps, dispatchProps, ownProps) {
    const { state } = ownProps.navigation;
    const projectID = state.params.projectID;
    const filteredTasks = stateProps.tasks.filter((task) => task.projectID == projectID);

    return {
        ...ownProps,
        tasks: filteredTasks,
        project: _.find(stateProps.projects, { id: projectID }),
        submit: async (name, callback) => {
            const lastTask = _.maxBy(filteredTasks, 'id');
            const id = lastTask ? lastTask.id + 1 : 1;

            try {
                const task = { id, name, projectID };
                const tasks = JSON.stringify([...stateProps.tasks, task]);
                await AsyncStorage.setItem('tasks', tasks);

                dispatchProps.submit(id, name, projectID);
                callback();
            } catch (error) {
                console.error(error);
            }
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(TaskList);