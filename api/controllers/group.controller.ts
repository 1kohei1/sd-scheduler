import { Request, Response } from 'express';
import { read, utils } from 'xlsx';
import * as crypto from 'crypto';
import { sign } from 'jsonwebtoken';

import DBUtil from '../utils/db.util';
import APIUtil from '../utils/api.util';
import Mailer, { MailType } from '../utils/mail.util';
import SocketIOUtil from '../utils/socketio.util';

// Cannot import the private namespace File. So copy what they use
// Ref: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/multer/index.d.ts
namespace Multer {
  export interface File {
    /** Field name specified in the form */
    fieldname: string;
    /** Name of the file on the user's computer */
    originalname: string;
    /** Encoding type of the file */
    encoding: string;
    /** Mime type of the file */
    mimetype: string;
    /** Size of the file in bytes */
    size: number;
    /** The folder to which the file has been saved (DiskStorage) */
    destination: string;
    /** The name of the file within the destination (DiskStorage) */
    filename: string;
    /** Location of the uploaded file (DiskStorage) */
    path: string;
    /** A Buffer of the entire file (MemoryStorage) */
    buffer: Buffer;
  }
}

interface MyRequest extends Request {
  file: Multer.File;
  files: {
    [fieldname: string]: Multer.File[];
  } | Multer.File[];
}

module.exports.findGroups = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      query: req.query,
    }
  };

  DBUtil.findGroups(req.query)
    .then(groups => {
      APIUtil.successResponse(info, groups, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    });
}

module.exports.createGroup = (req: MyRequest, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      body: req.body,
    }
  };

  const workbook = read(req.file.buffer, {
    type: 'buffer',
  });
  const spreadSheetGroups = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

  // I'm the only one who is gonna use this entry point. 
  // So it's ok to assume the format of given file
  // First column heading is "Group number" and the second column is "Emails" containing comma separated students' emails

  const { semester, adminFaculty } = req.body;

  const promises = spreadSheetGroups.map((groupData: any) => {
    const members = groupData.Emails
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .map((email: string) => {
        return {
          firstName: '',
          lastName: '',
          email,
        }
      });

    const body = {
      semester,
      members,
      adminFaculty,
      sponsors: [],
      groupNumber: groupData['Group number'],
    }

    return DBUtil.createGroup(body);
  });

  Promise.all(promises)
    .then(result => {
      APIUtil.successResponse(info, true, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}

module.exports.verifyAuthenticationToken = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      authenticationToken: req.params.authenticationToken,
    }
  };

  const { authenticationToken } = req.params;
  const query = {
    authenticationToken,
  }

  DBUtil.findGroups(query)
    .then(groups => {
      if (groups.length === 0) {
        return Promise.reject({
          message: 'Invalid token.'
        })
      } else {
        if (groups.length > 1) {
          console.log('Groups with duplicate token is found');
        }
        const group = groups[0];
        if (new Date().valueOf() < group.get('authenticationTokenExpireAt').valueOf()) {
          return DBUtil.updateGroup(group.get('_id'), {
            authenticationToken: '',
            authenticationTokenExpireAt: null,
          })
        } else {
          return Promise.reject({
            message: 'Token expired.',
          })
        }
      }
    })
    .then(updatedGroup => {
      // Generate JWT token and let user use PUT /api/groups/:_id, POST /api/presentations, and PUT /api/presentations/:_id
      const token = sign({
        // To avoid making change to other Group/Presentation by just specifying document id,
        // specify the group id this cookie can make change
        group_id: updatedGroup.get('_id'), 
      }, process.env.SECRET as string);

      APIUtil.successResponse(info, token, res);

      // Notify schedule page that user is verified
      SocketIOUtil.emit(authenticationToken, true);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}

module.exports.verifyAuthentication = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      _id: req.params._id,
      body: req.body,
    }
  };

  const { _id } = req.params;
  const { email } = req.body;

  const authenticationToken = crypto.randomBytes(48).toString('hex');
  const authenticationTokenExpireAt = new Date();
  authenticationTokenExpireAt.setMinutes(authenticationTokenExpireAt.getMinutes() + 15); // Set token expire in 15 minutes

  const update = {
    authenticationToken,
    authenticationTokenExpireAt,
  }

  DBUtil.updateGroup(_id, update)
    .then(updatedGroup => {
      APIUtil.successResponse(info, authenticationToken, res);

      // Send authentication email
      Mailer.send(MailType.verifystudentauthentication, {
        to: email,
        extra: {
          authenticationToken,
          groupNumber: updatedGroup.get('groupNumber'),
        }
      })
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}

module.exports.updateGroup = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      _id: req.params._id,
      body: req.body,
    }
  };

  DBUtil.updateGroup(req.params._id, req.body)
    .then(updatedGroup => {
      APIUtil.successResponse(info, updatedGroup, res);
    })
    .catch(err => {
      info.debugInfo.message = err.message;
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}