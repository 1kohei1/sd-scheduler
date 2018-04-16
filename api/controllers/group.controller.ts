import { Request, Response } from 'express';
import { read, utils } from 'xlsx';
import * as crypto from 'crypto';
import { sign } from 'jsonwebtoken';
import { Document } from 'mongoose';

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

interface Member {
  firstName: string;
  lastName: string;
  email: string;
  groupNumber: string;
}

module.exports.findGroups = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      query: req.query,
    }
  };

  DBUtil.findGroups(req.query)
    .then((groups: Document[]) => {
      // To protect student identity, don't expose members information if it's not faculty
      if (req.isUnauthenticated()) {
        groups.forEach((group: Document) => {
          group.set('members', []);;
        });
      }
      APIUtil.successResponse(info, groups, res);
    })
    .catch(err => {
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
  // If header exists, remove the header option and replace the accessing property below
  const spreadSheetGroups = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
    header: ['firstName', 'lastName', 'email', 'groupNumber'],
  });

  const { semester, adminFaculty } = req.body;

  const groups: {
    [key: string]: Member[];
  } = {};

  spreadSheetGroups.forEach((member: Member) => {
    const groupNumber = `${parseInt(member.groupNumber)}`;

    if (!groups.hasOwnProperty(groupNumber)) {
      groups[groupNumber] = [];
    }

    delete member.groupNumber;

    groups[groupNumber].push(member);
  });

  const promises = Object.entries(groups)
    .map(([groupNumber, members]: [string, Member[]]) => {
      return DBUtil.createGroup({
        semester,
        members,
        adminFaculty,
        sponsors: [],
        groupNumber
      });
    });

  Promise.all(promises)
    .then(result => {
      APIUtil.successResponse(info, true, res);
    })
    .catch(err => {
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}

module.exports.isAuthenticated = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      _id: req.params._id,
      body: req.body,
    }
  };

  APIUtil.successResponse(info, {}, res);
}

module.exports.sendCode = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      _id: req.params._id,
      body: req.body,
    }
  };

  DBUtil.findGroups({
    _id: req.params._id
  })
    .then((groups: Document[]) => {
      if (groups.length === 0) {
        return Promise.reject({
          message: 'Specified group does not exist',
        });
      }

      const members = groups[0].get('members');
      const index = members
        .map((member: Document) => member.toJSON())
        .findIndex((member: any) => member.email === req.body.email);

      if (index === -1) {
        return Promise.reject({
          message: 'Specified email is not part of the group',
        })
      } else {
        // Generate 6 length digit characters. 
        // Generate this way to have leading 0
        const nums = [];
        for (let i = 0; i < 6; i++) {
          nums.push(`${Math.floor(Math.random() * 10)}`);
        }
        const code = nums.join('');

        return DBUtil.updateGroup(req.params._id, {
          verificationCode: code,
          verificationCodeReceiverId: members[index].get('_id'),
        });
      }

    })
    .then((updatedGroup: Document) => {
      APIUtil.successResponse(info, updatedGroup, res);
    })
    .catch(err => {
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}

module.exports.verifyCode = (req: Request, res: Response) => {
  const info: any = {
    key: APIUtil.key(req),
    debugInfo: {
      _id: req.params._id,
      body: req.body,
    }
  };

  DBUtil.findGroups({
    _id: req.params._id,
  })
    .then((groups: Document[]) => {
      if (groups.length === 0) {
        return Promise.reject({
          message: 'Provided group does not exists',
        });
      } else {
        const group = groups[0];
        if (new Date().valueOf() < group.get('verificationCodeExpireAt').valueOf()) {
          if (group.get('verificationCode') === req.body.code) {
            return DBUtil.updateGroup(req.params._id, {
              verificationCode: '',
            })
          } else {
            return Promise.reject({
              message: 'Your code does not match',
            })
          }
        } else {
          return Promise.reject({
            message: 'Your token has expired. Please send another verification code',
          })
        }
      }
    })
    .then((updatedGroup: Document) => {
      const token = sign({
        // To avoid making change to other Group/Presentation by just specifying document id in API,
        // specify the group id this cookie can make change
        group_id: updatedGroup.get('_id'),
      }, process.env.SECRET as string, {
        expiresIn: '1h',
      });

      APIUtil.successResponse(info, token, res);
    })
    .catch(err => {
      APIUtil.errorResponse(info, err.message, err, res);
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
      APIUtil.errorResponse(info, err.message, {}, res);
    })
}