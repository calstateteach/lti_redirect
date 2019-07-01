# Redirect LTI for Canvas Users

LTI for [Canvas](https://www.canvaslms.com/) that does an HTTP redirect specific to the Canvas user. This was created to customize links in online workbooks for [CalStateTEACH](https://www.calstateteach.net/) users of Canvas.

### Prerequisites

The Web app uses the [Express](https://expressjs.com/) framework for [Node.js](https://nodejs.org/). The app calls a proprietary 3rd party Web service for additional data about Canvas users.

### Configuration

Configuration files are in the *config/* folder. These are CSV files with target assignment URLs that are adjusted each term. Configuration strings retrieved from the runtime environment are specified in the *.env* file.

### Web App Entry Points

The LTI is expected to be entered by an LTI launch request using OAuth, which in production is a POST request from the Canvas app. The launch URL is the route */lti/params* in the root of the Web app. 

There is also a */dev/lookup* route in the root of the Web app for a page that allows LTI admins to view & test the app configuration.

The project's *routes* & *views* folders contain these subfolders:

* *lti/* contains code executed for LTI users.
* *dev/* contains code for the test page accessed by LTI admins & developers.

## Deployment

In production, the Web app runs on an [Amazon EC2](https://aws.amazon.com/ec2/) instance running Ubuntu.


## Authors

* **Terence Shek** - *Programmer* - [tpshek](https://github.com/tpshek/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
