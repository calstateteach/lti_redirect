# Redirect LTI for Canvas Users

LTI for [Canvas](https://www.canvaslms.com/) that does an HTTP redirect specific to the Canvas user. This was created to customize links in online workbooks for [CalStateTEACH](https://www.calstateteach.net/) users of Canvas.

### Prerequisites

The Web app uses the [Express](https://expressjs.com/) framework for [Node.js](https://nodejs.org/). The app calls a proprietary 3rd party Web service for additional data about Canvas users.

### Configuration

Configuration files are in the *config/* folder. Configuration strings retrieved from the runtime environment are specified in the *.env* file.

## Deployment

In production, the Web app runs on an [Amazon EC2](https://aws.amazon.com/ec2/) instance running Ubuntu.


## Authors

* **Terence Shek** - *Programmer* - [tpshek](https://github.com/tpshek/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
