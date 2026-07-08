import "firebase/firestore";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where
} from "firebase/firestore";
import firebaseDb from "./firebaseDb";

const db = getFirestore(firebaseDb);

export const getLoginUser = (username: string, password: string) => {
  return new Promise<any>((resolve, reject) => {
    const q = query(
      collection(db, "loginUsers"),
      where("username", "==", username),
      where("password", "==", password)
    );
    getDocs(q)
      .then((querySnapshot) => {
        // An empty snapshot means bad credentials. Resolve null rather than
        // leaving the promise pending forever, which hangs the login spinner.
        if (querySnapshot.empty) {
          resolve(null);
          return;
        }
        const match = querySnapshot.docs[0];
        resolve({ ...match.data(), id: match.id });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getClients = () => {
  return new Promise(async (resolve, reject) => {
    const q = query(collection(db, "clients"));
    getDocs(q)
      .then((querySnapshot) => {
        const clientList: any = [];
        querySnapshot.forEach((doc) => {
          clientList.push(doc.data());
        });
        resolve(clientList);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getFixedDeposit = () => {
  return new Promise(async (resolve, reject) => {
    const q = query(collection(db, "fixedDeposit"));
    getDocs(q)
      .then((querySnapshot) => {
        const fixedDepositList: any = [];
        querySnapshot.forEach((doc) => {
          fixedDepositList.push(doc.data());
        });
        console.log(fixedDepositList)
        resolve(fixedDepositList);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export type FixedDepositInput = {
  clientId: string;
  depositorName: string;
  amount: string;
  interest: string;
  interestPercentage: string;
  depositedDate: string;
  maturityDate: string;
  /** Owning login user. Preserved verbatim on edit so it is never blanked. */
  loginUserId?: string;
  canShow?: boolean;
  isCompleted?: boolean;
};

export const addFixedDeposit = (input: FixedDepositInput) => {
  return new Promise((resolve, reject) => {
    const refId = doc(collection(db, "fixedDeposit")).id;
    setDoc(doc(db, "fixedDeposit", refId), {
      ...input,
      id: refId,
      loginUserId: input.loginUserId ?? "",
      canShow: input.canShow ?? true,
      isCompleted: input.isCompleted ?? false,
    })
      .then(() => {
        resolve("");
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const updateFixedDeposit = (refId: string, input: FixedDepositInput) => {
  return new Promise((resolve, reject) => {
    // setDoc replaces the whole document, so every preserved field has to be
    // written back explicitly or it is lost.
    setDoc(doc(db, "fixedDeposit", refId), {
      ...input,
      id: refId,
      loginUserId: input.loginUserId ?? "",
      canShow: input.canShow ?? true,
      isCompleted: input.isCompleted ?? false,
    })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const deleteFixedDeposit = (id: string) => {
  return new Promise(async (resolve, reject) => {
    deleteDoc(doc(db, "fixedDeposit", id))
      .then((querySnapshot) => {
        resolve(querySnapshot);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
