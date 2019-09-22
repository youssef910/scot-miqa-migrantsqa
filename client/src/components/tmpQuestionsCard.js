import React, { Component } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  Segment,
  TextArea,
  Accordion,
  Feed,
  Icon
} from "semantic-ui-react";
import { postAnswer } from "../api/questions";
import { getQuestions } from "../api/questions";
import { getAnswers, acceptAnswers } from "../api/answers";
import { Message } from "semantic-ui-react";

function formatingDate(date) {
  const event = new Date(date);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  };
  return event.toLocaleDateString("en-GB", options);
}

class Questions extends Component {
  constructor(props) {
    super(props);
    this.handleAcceptAnswerOnClick = this.handleAcceptAnswerOnClick.bind(this);
    this.state = {
      selectedCardId: null,
      editQuestion: null,
      editQuestionId: null,
      editContentQuestion: null,
      userId: "",
      isAccepted: false,
      content: "",
      score: "",
      tags: "",
      activeIndex: 0,
      questionUserID: null,
      answered: false
    };
  }

  // componentDidMount() {
  //   getQuestions().then(response => {
  //     this.setState({ questions: response });
  //   });
  //   getAnswers().then(res => {
  //     this.setState({ answers: res });
  //   });
  // }

  handleEditClick = (question, event) => {
    event.stopPropagation();
    this.setState({
      editQuestion: question,
      editContentQuestion: question.content,
      editQuestionId: question.id
    });
  };

  handleCancelClick = event => {
    event.stopPropagation();
    this.setState({
      editQuestion: null
    });
  };

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
    console.log("I am over here Bro ", activeIndex);
  };

  // get the id belonging to the answer from the click event
  // find the answer object matching that id in this.props.answers
  // get the isAccepted for the matching answer
  // call acceptAnswers with !isAccepted, id
  // update the state on a SUCCESSFUL return

  // // if (this.props.answers.is_accepted, this.props.answers.id) {
  // acceptAnswers(
  //   this.props.answers.is_accepted,
  //   this.props.answers.id
  // )}
  // console.log(acceptAnswers);

  // handleChange = e => {
  //   this.setState({
  //     [e.target.id]: e.target.value
  //   });
  // };

  handleAcceptAnswerOnClick = (e, a) => {
    console.clear();
    //kk
    let questionUserID = this.getQuestionUserID(a).questionUserID;
    if (localStorage.userId == questionUserID) {
      acceptAnswers(true, a.id)
        .then(result => {
          if (!this.state.isAccepted && result.message === "Answer accepted") {
            console.log("ACCEPED");
            this.props.pageReload();
            this.setState({ isAccepted: true, answered: true });
          } else {
            console.log("NOT");
            acceptAnswers(false, a.id)
              .then(x => x)
              .catch(error => {});
            this.setState({ isAccepted: false, answered: false });
          }
          console.log(this.handleAcceptAnswerOnClick, "hello Hi Looo");
        })
        .catch(err => {
          console.log("I am an error");
          console.error(err);
        });
    }

    e.preventDefault();
  };

  handleSaveClick = question => {
    question.stopPropagation();
    const postData = {
      method: "POST",
      body: JSON.stringify({
        content: this.state.editContentQuestion,
        date_posted: new Date(),
        id: this.state.editQuestionId
      }),
      headers: { "Content-Type": "application/json" }
    };
    return fetch("/api/questions/update-question", postData)
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          this.props.pageReload();
        } else {
          throw res;
        }
      })
      .then(loggedInUser => {
        this.setState(state => ({
          editQuestion: null
        }));
      })
      .catch(err => {});
  };

  getQuestionUserID(a) {
    let answerIsAccepted;
    let questionUserID;
    const answerID = a.id;

    this.props.questions.map(x => {
      if (x.id === a.question_id) {
        answerIsAccepted = a.is_accepted;
        questionUserID = x.user_id;
      }
    });
    console.log(this.props.userId);
    console.log(localStorage.userId, questionUserID);
    return { questionUserID, answerIsAccepted, answerID };
  }

  onChange(e) {
    this.setState({ editContentQuestion: e.target.value });
  }

  handleOnSubmitAnswer = e => {
    e.preventDefault();
    const { content, score, tags } = this.state;
    const questionId = this.props.QuestionId;

    postAnswer(content, tags, questionId)
      .then(result => {
        if (result.status === 200) {
          this.props.pageReload();
          this.setState({
            content: ""
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  render() {
    console.log(this.props.userId);
    console.log(localStorage.userId);
    const { questions } = this.props;
    console.log(questions);
    return (
      <Container>
        {this.props.questions.map((question, index) => {
          return (
            <Card fluid key={question.id}>
              <Card.Content>
                <Card.Header>
                  <Accordion>
                    <Accordion.Title
                      active={this.props.activeIndex === question.id}
                      index={question.id}
                      onClick={this.props.toggleAnswers}
                      id={`card-${index}`}
                    >
                      {this.state.editQuestion &&
                      this.state.editQuestion.id === question.id ? (
                        <Form>
                          <TextArea
                            value={this.state.editContentQuestion}
                            style={{ minHeight: 100 }}
                            onChange={e => this.onChange(e)}
                          />
                          <div className="ui two buttons">
                            <Button
                              onClick={this.handleSaveClick}
                              basic
                              color="green"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={this.handleCancelClick}
                              basic
                              color="gray"
                            >
                              Cancel
                            </Button>
                          </div>
                        </Form>
                      ) : (
                        question.content
                      )}
                      {this.props.userId === question.user_id &&
                      !this.state.editQuestion ? (
                        <Card.Content extra>
                          <div className="ui two buttons">
                            <Button
                              basic
                              color="green"
                              onClick={event =>
                                this.handleEditClick(question, event)
                              }
                            >
                              Edit
                            </Button>
                            <Button basic color="red">
                              Delete
                            </Button>
                          </div>
                        </Card.Content>
                      ) : null}
                    </Accordion.Title>

                    <Accordion.Content
                      active={this.props.activeIndex === question.id}
                    >
                      {this.props.answers.map(answer => {
                        return answer.question_id === question.id ? (
                          <Segment key={answer.answer_id} size="small">
                            <Card.Content>
                              <Card.Header> {answer.content} </Card.Header>
                            </Card.Content>
                            {/* kk */}
                            {this.getQuestionUserID(answer).questionUserID ==
                              localStorage.userId &&
                            !this.getQuestionUserID(answer).answerIsAccepted ? (
                              <div>
                                <div>
                                  {this.state.answered &&
                                  this.getQuestionUserID(answer)
                                    .answerIsAccepted ? (
                                    <div>
                                      <Button
                                        onClick={e =>
                                          this.handleAcceptAnswerOnClick(
                                            e,
                                            answer
                                          )
                                        }
                                      >
                                        <i class="check circle outline icon"></i>
                                      </Button>
                                    </div>
                                  ) : (
                                    <div>
                                      {this.state.isAccepted ? (
                                        <Button
                                          onClick={e =>
                                            this.handleAcceptAnswerOnClick(
                                              e,
                                              answer
                                            )
                                          }
                                        >
                                          <i class="check circle outline icon"></i>
                                        </Button>
                                      ) : (
                                        <Button
                                          onClick={e =>
                                            this.handleAcceptAnswerOnClick(
                                              e,
                                              answer
                                            )
                                          }
                                        >
                                          <i class="freebsd icon"></i>
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null}
                            {this.getQuestionUserID(answer).answerIsAccepted &&
                            answer.id ==
                              this.getQuestionUserID(answer).answerID ? (
                              <div>true</div>
                            ) : (
                              <div>
                                {this.getQuestionUserID(answer)
                                  .answerIsAccepted &&
                                answer.id ==
                                  this.getQuestionUserID(answer).answerID
                                  ? null
                                  : ""}
                              </div>
                            )}

                            <Card.Meta textAlign="right">
                              {formatingDate(answer.date_answered)}
                            </Card.Meta>
                            <Card.Meta textAlign="right">
                              by {answer.username}
                            </Card.Meta>
                          </Segment>
                        ) : null;
                      })}
                      <Form onSubmit={this.handleOnSubmitAnswer}>
                        <Form.TextArea
                          placeholder="Please write you answer here..."
                          required
                          minLength={2}
                          name="content"
                          onChange={this.handleChange}
                          value={this.state.content}
                          type="text"
                        />
                        <Form.Button>Submit</Form.Button>
                      </Form>
                    </Accordion.Content>
                  </Accordion>
                </Card.Header>
                <Card.Meta
                  textAlign="right"
                  style={{
                    fontSize: "12px",
                    fontStyle: "italic"
                  }}
                >
                  {question.tags > 1 ? question.tags.join(" #") : question.tags}
                </Card.Meta>
                <Card.Meta textAlign="right">
                  {formatingDate(question.date_posted)}
                </Card.Meta>
                <Card.Meta textAlign="right"> by {question.username}</Card.Meta>
              </Card.Content>
            </Card>
          );
        })}
      </Container>
    );
  }
}
export default Questions;
