import axios from "axios";
import React, { useState } from "react";

const App = () => {
  const [grade, setGrade] = useState("");
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState(null);
  const [gradeScore, setGradeScore] = useState(null);
  const [distanceScore, setDistanceScore] = useState(null);
  const [totalScore, setTotalScore] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const baseLocation = { lat: 37.4512348695085, lng: 127.12939432624 };

  const handleAddressSearch = async () => {
    if (!address) return;

    try {
      const response = await axios.get(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${address}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_API_KEY}`,
          },
        }
      );

      const { documents } = response.data;

      if (documents.length === 0) {
        alert("주소를 찾을 수 없습니다.");
        return;
      }

      if (documents.length > 1) {
        alert("검색 결과가 많습니다. 도로명주소 또는 지번주소를 상세히 입력해주세요.");
        return;
      }

      const { x, y } = documents[0].address;
      const userLocation = { lat: parseFloat(y), lng: parseFloat(x) };
      const dist = calculateDistance(baseLocation, userLocation);

      setDistance(dist);
      setApiResponse(documents[0]);
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const calculateDistance = (loc1, loc2) => {
    const R = 6371e3; // metres
    const φ1 = (loc1.lat * Math.PI) / 180;
    const φ2 = (loc2.lat * Math.PI) / 180;
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return d / 1000; // in kilometres
  };

  const calculateScores = () => {
    const maxDistance = 488.58; // maximum distance corresponding to 100 points
    const gradeMax = 4.5; // maximum grade corresponding to 100 points
    const calculatedGradeScore = (parseFloat(grade) / gradeMax) * 100;
    const calculatedDistanceScore = (distance / maxDistance) * 100;
    const totalScore = calculatedGradeScore + calculatedDistanceScore;

    setGradeScore(calculatedGradeScore.toFixed(2));
    setDistanceScore(calculatedDistanceScore.toFixed(2));
    setTotalScore(totalScore.toFixed(2));
  };

  const handleGradeChange = (e) => {
    const value = parseFloat(e.target.value);
    if (value < 0 || value > 4.5) {
      alert("성적은 0.00부터 4.50 사이의 값이어야 합니다.");
      setGrade("");
      return;
    }
    setGrade(e.target.value);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">가천대학교 생활관<br/>입사컷 산출 계산기</h1>
      <div className="row justify-content-center">
        <div className="col-md-5 box">
          <h4 className="text-center">성적</h4>
          <input
            type="number"
            className="form-control"
            value={grade}
            onChange={handleGradeChange}
            placeholder="지난 학기 평점을 입력해주세요 (0.00 - 4.50)"
            min="0.00"
            max="4.50"
            step="0.01"
          />
        </div>
        <div className="col-md-5 box">
          <h4 className="text-center">거리</h4>
          <input
            type="text"
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={handleAddressSearch}
            onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
            placeholder="도로명주소(지번주소)를 입력해주세요"
          />
          {apiResponse && (
            <div className="mt-3">
              <p><strong>Address:</strong> {apiResponse.address.address_name}</p>
              <p><strong>Road Address:</strong> {apiResponse.road_address?.address_name}</p>
              <p><strong>Building Name:</strong> {apiResponse.road_address?.building_name}</p>
            </div>
          )}
        </div>
      </div>
      <div className="text-center mt-4">
        <button className="btn btn-primary" onClick={calculateScores}>계산하기</button>
      </div>
      {totalScore !== null && gradeScore !== null && distanceScore !== null && (
        <div className="text-center mt-4">
          <h4>성적 {gradeScore}점 + 거리 {distanceScore}점</h4>
          <h3>총합 {totalScore} / 200점</h3>
          <p><strong>&lt; 산출 근거 &gt;</strong></p>
          <p>학점 {parseFloat(grade).toFixed(2)} / 4.50 → 환산 점수 {gradeScore} / 100점</p>
          <p>거리 {distance.toFixed(2)} km → 환산 점수 {distanceScore} / 100점</p>
        </div>
      )}
    </div>
  );
};

export default App;
