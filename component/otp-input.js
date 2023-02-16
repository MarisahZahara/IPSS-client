import OTPInput, { ResendOTP } from "otp-input-react";
import React, { useState, useEffect } from "react";

const otpInput = (props) => {
  const [OTP, setOTP] = useState("");

  useEffect(() => {
    props.getOTP(OTP);
  }, [OTP]);

  const renderTime = () => React.Fragment;

  const renderButton = (buttonProps) => {
    return (
      <div style={{ textAlign: "center" }}>
        {buttonProps.remainingTime === 0 ? (
          <p className="otp-resend-info-text">
            Click to{" "}
            <span className="kirim-ulang-button" {...buttonProps}>
              {" "}
              Resend OTP
            </span>
          </p>
        ) : (
          <p className="otp-resend-info-text">
            Didn't recieve OTP? Please wait for
            <span style={{ color: "black", fontWeight: "normal" }}> {buttonProps.remainingTime} Second </span>
            <span> to resend OTP</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="otp-modal-div">
        <p className="otp-title">OTP Verification</p>
        {/* <p className="otp-info">OTP code has been sent to {hideEmail(props.userEmail)}</p> */}
        <p className="otp-info">OTP code has been sent to {props.userEmail}</p>
        <div className="otp-input-div">
          {/* <ResendOTP onResendClick={() => {console.log(resendClicked); increase(); {resendClicked === 2 && reset()}}} maxTime={10} style={{ textAlign: "center", justifyContent: "center" }} renderButton={renderButton} renderTime={renderTime} /> */}
          <OTPInput className="otp-input" inputClassName="otp-input-box" style={{ justifyContent: "center" }} value={OTP} onChange={setOTP} autoFocus OTPLength={6} otpType="number" disabled={false} />
          <ResendOTP
            // onResendClick={() => {
            //   props.resendOTP();
            //   increase();
            //   {
            //     resendClicked === 1 && reset();
            //   }
            // }}
            onResendClick={() => {
              props.resendOTP();
            }}
            maxTime={30}
            style={{ textAlign: "center", justifyContent: "center", marginTop: 15 }}
            renderButton={renderButton}
            renderTime={renderTime}
          />
        </div>
      </div>
    </>
  );
};

export default otpInput;
